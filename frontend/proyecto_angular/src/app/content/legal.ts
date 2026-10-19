import { legalAnchors, legalTitles } from './legal-index';
import { academicNote } from './site';
import type { LegalDocument, RichText } from './types';

/*
 * Full texts of `/legal`. Not exported from the content barrel: only the lazy `/legal` page
 * imports this module, so the texts never reach the initial bundle.
 *
 * They are a reference base aligned with Ley 1581 de 2012 and Decreto 1377 de 2013 for a
 * fictitious company of an academic project (see `responsible.ts`); they are not legal advice.
 */

export const legalNotice: RichText = [
  `${academicNote} `,
  'Estos textos son una base de referencia preparada a partir de la Ley 1581 de 2012 y el ',
  'Decreto 1377 de 2013. No constituyen asesoría legal: una empresa real debe revisarlos con ',
  'un abogado antes de adoptarlos.'
];

export const legalLastUpdated: RichText = ['Última actualización: ', { field: 'effectiveDate' }, '.'];

const dataPolicy: LegalDocument = {
  id: legalAnchors.dataPolicy,
  title: legalTitles.dataPolicy,
  blocks: [
    {
      heading: 'Identificación del responsable',
      paragraphs: [
        [
          'El responsable del tratamiento de los datos personales recolectados a través del ',
          'sitio y de la plataforma KUVU es ',
          { field: 'legalName' },
          { field: 'taxId', prefix: ', identificado con NIT ' },
          ', con domicilio en ',
          { field: 'domicile' },
          '.'
        ]
      ],
      items: [
        [{ field: 'address', prefix: 'Dirección: ' }],
        [{ field: 'email', prefix: 'Correo electrónico: ' }],
        [{ field: 'phone', prefix: 'Teléfono y WhatsApp: ' }],
        [
          'Formulario: ',
          { link: '/contacto', label: 'página de contacto' }
        ]
      ]
    },
    {
      heading: 'Marco normativo',
      paragraphs: [
        [
          'Esta política se expide en cumplimiento de la Ley Estatutaria 1581 de 2012, por la ',
          'cual se dictan disposiciones generales para la protección de datos personales, y del ',
          'Decreto 1377 de 2013, compilado en el Decreto Único Reglamentario 1074 de 2015.'
        ]
      ]
    },
    {
      heading: 'Definiciones',
      paragraphs: [['Para efectos de esta política se entiende por:']],
      items: [
        ['Titular: persona natural cuyos datos personales son objeto de tratamiento.'],
        ['Dato personal: cualquier información vinculada o que pueda asociarse a una persona natural determinada o determinable.'],
        ['Dato sensible: aquel que afecta la intimidad del titular o cuyo uso indebido puede generar su discriminación.'],
        ['Tratamiento: cualquier operación sobre datos personales, como la recolección, el almacenamiento, el uso, la circulación o la supresión.'],
        ['Responsable del tratamiento: quien decide sobre la base de datos y el tratamiento de los datos.'],
        ['Encargado del tratamiento: quien realiza el tratamiento de datos por cuenta del responsable.'],
        ['Autorización: consentimiento previo, expreso e informado del titular para llevar a cabo el tratamiento.']
      ]
    },
    {
      heading: 'Datos que tratamos y finalidades',
      paragraphs: [['KUVU trata datos personales según su origen:']],
      items: [
        [
          'Visitantes que escriben por el formulario de contacto o por WhatsApp: nombre, empresa, ',
          'correo electrónico, teléfono y el contenido del mensaje. Finalidad: responder la ',
          'solicitud y dar información sobre KUVU.'
        ],
        [
          'Usuarios de la plataforma: nombre, correo electrónico, número de documento, rol y ',
          'empresa a la que pertenecen. Finalidades: autenticar el acceso, operar el servicio ',
          'contratado por la inmobiliaria y brindar soporte.'
        ],
        [
          'Información que cada inmobiliaria carga sobre sus arrendatarios, locales, contratos, ',
          'pagos y mantenimientos: KUVU la trata por cuenta de la inmobiliaria, que actúa como ',
          'responsable frente a sus titulares. KUVU actúa como encargado y solo la usa para ',
          'prestar el servicio.'
        ]
      ]
    },
    {
      heading: 'Principios del tratamiento',
      paragraphs: [
        [
          'El tratamiento se rige por los principios de legalidad, finalidad, libertad, ',
          'veracidad o calidad, transparencia, acceso y circulación restringida, seguridad y ',
          'confidencialidad previstos en el artículo 4 de la Ley 1581 de 2012.'
        ]
      ]
    },
    {
      heading: 'Derechos del titular',
      paragraphs: [['De acuerdo con el artículo 8 de la Ley 1581 de 2012, el titular tiene derecho a:']],
      items: [
        ['Conocer, actualizar y rectificar sus datos personales.'],
        ['Solicitar prueba de la autorización otorgada, salvo cuando la ley no la exija.'],
        ['Ser informado, previa solicitud, sobre el uso que se ha dado a sus datos.'],
        ['Presentar quejas ante la Superintendencia de Industria y Comercio por infracciones a la ley, una vez agotado el trámite de consulta o reclamo ante el responsable.'],
        ['Revocar la autorización y/o solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías legales.'],
        ['Acceder en forma gratuita a sus datos personales.']
      ]
    },
    {
      heading: 'Autorización',
      paragraphs: [
        [
          'KUVU solicita la autorización del titular de manera previa, expresa e informada. En el ',
          'formulario de contacto, la autorización se otorga marcando la casilla de aceptación ',
          'antes de enviar la solicitud. Los usuarios de la plataforma son dados de alta por su ',
          'inmobiliaria, que es la encargada de obtener la autorización de sus titulares.'
        ]
      ]
    },
    {
      heading: 'Datos sensibles y de menores',
      paragraphs: [
        [
          'KUVU no solicita datos sensibles. Si alguna vez se pidiera uno, responder es ',
          'facultativo para el titular. KUVU no solicita ni trata de forma intencional datos de ',
          'niños, niñas o adolescentes.'
        ]
      ]
    },
    {
      heading: 'Área responsable y canales de atención',
      paragraphs: [
        [
          'Las consultas y reclamos sobre datos personales los atiende ',
          { field: 'attentionArea' },
          ', a través del formulario de la ',
          { link: '/contacto', label: 'página de contacto' },
          ', del WhatsApp ',
          { field: 'phone' },
          { field: 'email', prefix: ' o del correo ' },
          '. En el mensaje indica que se trata de una consulta o un reclamo sobre datos personales.'
        ]
      ]
    },
    {
      heading: 'Procedimiento para consultas y reclamos',
      paragraphs: [
        [
          'Consultas: se atienden en un término máximo de diez (10) días hábiles contados a ',
          'partir de su recibo. Si no es posible atenderlas en ese plazo, se informa al titular ',
          'el motivo y la nueva fecha, que no supera cinco (5) días hábiles adicionales.'
        ],
        [
          'Reclamos: el titular que considere que su información debe ser corregida, actualizada ',
          'o suprimida, o que advierta un incumplimiento, puede presentar un reclamo con su ',
          'identificación, la descripción de los hechos, la dirección de contacto y los ',
          'documentos que quiera hacer valer. Si el reclamo está incompleto, se le pide subsanarlo ',
          'dentro de los cinco (5) días siguientes; si pasan dos (2) meses sin respuesta, se ',
          'entiende que desistió.'
        ],
        [
          'Los reclamos se atienden en un término máximo de quince (15) días hábiles contados a ',
          'partir del día siguiente a su recibo. Si no es posible atenderlos en ese plazo, se ',
          'informa al titular el motivo y la nueva fecha, que no supera ocho (8) días hábiles ',
          'adicionales.'
        ]
      ]
    },
    {
      heading: 'Seguridad de la información',
      paragraphs: [
        [
          'KUVU aplica medidas para proteger los datos: cada usuario accede con su cuenta y ve ',
          'solo lo que su rol le permite, y la información de cada inmobiliaria se gestiona por ',
          'separado de la de las demás.'
        ]
      ]
    },
    {
      heading: 'Transferencias y transmisiones',
      paragraphs: [
        [
          'KUVU no vende ni cede datos personales a terceros. Los proveedores de infraestructura ',
          'que alojan el servicio pueden acceder a los datos solo como encargados, para prestar ',
          'ese servicio y bajo deber de confidencialidad.'
        ]
      ]
    },
    {
      heading: 'Vigencia',
      paragraphs: [
        [
          'Esta política rige a partir del ',
          { field: 'effectiveDate' },
          '. Los datos se conservan mientras dure la relación con el titular o la inmobiliaria y ',
          'durante el tiempo que exijan las obligaciones legales aplicables.'
        ]
      ]
    }
  ]
};

const privacyNotice: LegalDocument = {
  id: legalAnchors.privacyNotice,
  title: legalTitles.privacyNotice,
  blocks: [
    {
      paragraphs: [
        [
          { field: 'legalName' },
          { field: 'taxId', prefix: ', identificado con NIT ' },
          ', con domicilio en ',
          { field: 'domicile' },
          { field: 'email', prefix: ' y correo ' },
          ', es responsable del tratamiento de los datos personales que se recolectan en este ',
          'sitio y en la plataforma KUVU.'
        ],
        [
          'Los datos se usan para responder solicitudes de contacto, autenticar a los usuarios, ',
          'operar el servicio que contrata cada inmobiliaria y brindar soporte.'
        ],
        [
          'Como titular, puedes conocer, actualizar, rectificar y suprimir tus datos, solicitar ',
          'prueba de la autorización, revocarla y presentar quejas ante la Superintendencia de ',
          'Industria y Comercio.'
        ],
        [
          'La política completa, con el procedimiento para ejercer estos derechos, está en la ',
          { link: '/legal', fragment: legalAnchors.dataPolicy, label: legalTitles.dataPolicy },
          '.'
        ]
      ]
    }
  ]
};

const terms: LegalDocument = {
  id: legalAnchors.terms,
  title: legalTitles.terms,
  blocks: [
    {
      heading: 'Objeto',
      paragraphs: [
        [
          'Estos términos regulan el uso del sitio público de KUVU y de la plataforma de ',
          'administración inmobiliaria. Usar el sitio o la plataforma implica aceptarlos.'
        ]
      ]
    },
    {
      heading: 'Acceso a la plataforma',
      paragraphs: [
        [
          'El acceso a la plataforma es por invitación: cada inmobiliaria da de alta a sus ',
          'usuarios y les asigna un rol. No hay registro abierto al público.'
        ]
      ]
    },
    {
      heading: 'Responsabilidades del usuario',
      paragraphs: [['Quien usa la plataforma se compromete a:']],
      items: [
        ['Mantener la confidencialidad de sus credenciales de acceso.'],
        ['Usar el servicio de forma lícita y solo para la gestión de su inmobiliaria.'],
        ['Cargar información veraz y contar con la autorización de los titulares de los datos que registra.']
      ]
    },
    {
      heading: 'Propiedad intelectual',
      paragraphs: [
        [
          'La marca KUVU, el diseño del sitio y el software de la plataforma pertenecen a ',
          { field: 'legalName' },
          '. Los datos que carga cada inmobiliaria siguen siendo de esa inmobiliaria.'
        ]
      ]
    },
    {
      heading: 'Disponibilidad del servicio',
      paragraphs: [
        [
          'KUVU procura que el servicio esté disponible de forma continua, sin garantizar que ',
          'esté libre de interrupciones por mantenimiento, fallas técnicas o causas ajenas.'
        ]
      ]
    },
    {
      heading: 'Enlaces a terceros',
      paragraphs: [
        [
          'El sitio enlaza a servicios de terceros, como WhatsApp, que se rigen por sus propios ',
          'términos y políticas de privacidad.'
        ]
      ]
    },
    {
      heading: 'Modificaciones',
      paragraphs: [
        [
          'KUVU puede modificar estos términos. La versión vigente es la publicada en esta ',
          'página, con su fecha de actualización.'
        ]
      ]
    },
    {
      heading: 'Ley aplicable y contacto',
      paragraphs: [
        [
          'Estos términos se rigen por las leyes de la República de Colombia. Para cualquier ',
          'consulta, escríbenos desde la ',
          { link: '/contacto', label: 'página de contacto' },
          ' o por WhatsApp al ',
          { field: 'phone' },
          { field: 'email', prefix: ' o al correo ' },
          '.'
        ]
      ]
    }
  ]
};

/**
 * Names of the browser storage entries the site actually uses. The cookies document lists
 * exactly these entries, so it never mentions storage the site does not use.
 */
export const browserStorageUses: readonly string[] = [
  'Preferencia de tema',
  'Sesión iniciada',
  'Empresa preseleccionada'
];

const cookies: LegalDocument = {
  id: legalAnchors.cookies,
  title: legalTitles.cookies,
  blocks: [
    {
      paragraphs: [
        [
          'KUVU no usa cookies de analítica, de publicidad ni de terceros. Para funcionar, ',
          'guarda en tu navegador solo la información técnica y de preferencia que se lista a ',
          'continuación.'
        ]
      ]
    },
    {
      heading: 'Qué guardamos en tu navegador',
      paragraphs: [],
      items: [
        ['Preferencia de tema: recuerda si elegiste el modo claro u oscuro (almacenamiento local).'],
        [
          'Sesión iniciada: guarda la empresa y el usuario con los que ingresaste, para mantener ',
          'la sesión al recargar (almacenamiento local).'
        ],
        [
          'Empresa preseleccionada: recuerda la inmobiliaria elegida en la pantalla de acceso ',
          'hasta iniciar sesión (almacenamiento de la sesión del navegador).'
        ]
      ]
    },
    {
      heading: 'Cómo borrarlo',
      paragraphs: [
        [
          'Puedes borrar esta información desde la configuración de privacidad de tu navegador, ',
          'en la opción de datos de sitios. Cerrar sesión en la plataforma elimina los datos de ',
          'la sesión iniciada.'
        ]
      ]
    }
  ]
};

/** The four documents of `/legal`, in display order. */
export const legalDocuments: readonly LegalDocument[] = [dataPolicy, privacyNotice, terms, cookies];

/** Plain text of a rich text, with pending fields as their field name. Used by tests and meta. */
export function richTextToPlain(text: RichText): string {
  return text
    .map((segment) => {
      if (typeof segment === 'string') return segment;
      if ('field' in segment) return `{${segment.field}}`;
      return segment.label;
    })
    .join('');
}
