// In-memory double of the mysql2 pool for the usuarios / auth tests. It answers by SQL
// shape (not by call order) because a login runs a SELECT and then UPDATEs.
//
// Supported statements: the account lookup of auth/credentials.js, the usuarios route
// SELECTs, `UPDATE usuarios SET col = ? | <number> | NULL, ... WHERE idUsuario = ?` and
// `INSERT INTO usuarios (cols) VALUES (?, ..., <number>)`.

const EMPRESAS = [
  { id: 1, nombre: 'Amarilo', activo: 1, color_primario: '#111', color_secundario: '#222', color_texto: '#fff', logo_url: '', slogan: 's1' },
  { id: 2, nombre: 'Nido Rent', activo: 1, color_primario: '#333', color_secundario: '#444', color_texto: '#fff', logo_url: '', slogan: 's2' },
  { id: 3, nombre: 'Inactiva', activo: 0, color_primario: '#555', color_secundario: '#666', color_texto: '#fff', logo_url: '', slogan: 's3' },
];
const ROLES = { 1: 'Administrador', 2: 'Arrendatario' };

function createFakeDb() {
  const db = {
    usuarios: [],
    calls: [],
    error: null,

    addUsuario(u) {
      const row = {
        idUsuario: db.usuarios.length + 1,
        telefono: null,
        password_hash: null,
        debe_cambiar_password: 0,
        intentos_fallidos: 0,
        bloqueado_hasta: null,
        ...u,
      };
      db.usuarios.push(row);
      return row;
    },

    find(id) {
      return db.usuarios.find((u) => u.idUsuario === Number(id));
    },

    async execute(sql, params = []) {
      db.calls.push({ sql, params });
      if (db.error) throw db.error;
      const s = sql.replace(/\s+/g, ' ').trim();

      if (/^SELECT/i.test(s) && /WHERE u\.correo = \? AND u\.empresa_id = \?/i.test(s)) {
        const [correo, empresaId] = params;
        const rows = db.usuarios
          .filter((u) => u.correo === correo && u.empresa_id === empresaId)
          .map((u) => ({ u, e: EMPRESAS.find((e) => e.id === u.empresa_id) }))
          .filter(({ e }) => e && e.activo === 1)
          .map(({ u, e }) => ({
            ...u,
            nombreRol: ROLES[u.idRol],
            nombreEmpresa: e.nombre,
            color_primario: e.color_primario,
            color_secundario: e.color_secundario,
            color_texto: e.color_texto,
            logo_url: e.logo_url,
            slogan: e.slogan,
          }));
        return [rows, []];
      }

      if (/^SELECT/i.test(s) && /FROM usuarios/i.test(s)) {
        const cols = s.slice(7, s.search(/ FROM /i)).split(',').map((c) => c.trim());
        let rows = db.usuarios;
        if (/WHERE u?\.?empresa_id = \?/i.test(s)) rows = rows.filter((u) => u.empresa_id === Number(params[0]));
        if (/WHERE u?\.?idUsuario = \?/i.test(s)) rows = rows.filter((u) => u.idUsuario === Number(params[0]));
        if (/WHERE password_hash IS NULL/i.test(s)) rows = rows.filter((u) => u.password_hash == null);
        const project = (u) => {
          const out = {};
          for (const c of cols) {
            const name = c.replace(/^\w+\./, '');
            if (name === '*') Object.assign(out, u);
            else if (name === 'nombreRol') out.nombreRol = ROLES[u.idRol];
            else out[name] = u[name];
          }
          return out;
        };
        return [rows.map(project), []];
      }

      let m = s.match(/^UPDATE usuarios SET (.+) WHERE idUsuario ?= ?\?(.*)$/i);
      if (m) {
        const assigns = m[1].split(',').map((a) => a.trim().split(/\s*=\s*/));
        let i = 0;
        const values = assigns.map(([col, v]) => {
          if (v === '?') return [col, params[i++]];
          if (/^NULL$/i.test(v)) return [col, null];
          return [col, Number(v)];
        });
        const id = Number(params[i++]);
        const row = db.find(id);
        let affectedRows = 0;
        const extra = m[2].trim();
        const ok = row && (!/password_hash IS NULL/i.test(extra) || row.password_hash == null);
        if (ok) {
          for (const [col, v] of values) row[col] = v;
          affectedRows = 1;
        }
        return [{ affectedRows }, []];
      }

      m = s.match(/^INSERT INTO usuarios \(([^)]+)\) VALUES \(([^)]+)\)$/i);
      if (m) {
        const cols = m[1].split(',').map((c) => c.trim());
        const vals = m[2].split(',').map((v) => v.trim());
        let i = 0;
        const row = {};
        cols.forEach((c, k) => { row[c] = vals[k] === '?' ? params[i++] : Number(vals[k]); });
        const created = db.addUsuario(row);
        return [{ insertId: created.idUsuario, affectedRows: 1 }, []];
      }

      if (/^DELETE FROM usuarios/i.test(s)) {
        db.usuarios = db.usuarios.filter((u) => u.idUsuario !== Number(params[0]));
        return [{ affectedRows: 1 }, []];
      }

      throw new Error(`fake-db: unsupported SQL: ${s}`);
    },
  };
  return db;
}

module.exports = { createFakeDb };
