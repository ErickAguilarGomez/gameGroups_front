export const userTableFields = [
  { 
    key: 'name', 
    label: 'Usuario', 
    sortable: true,
    visible: true,
    thClass: 'text-start',
    tdClass: 'text-start'
  },
  {
    key:"birthdate",
    label:"Fecha Nacimiento",
    sortable:true,
    visible:true,
    thClass: 'text-center',
    tdClass: 'text-center'
  },
  {
    key: 'social_network',
    label: 'Red Social',
    sortable: false,
    visible: true,
    thClass: 'text-center',
    tdClass: 'text-center'
  },
  { 
    key: 'photo_status', 
    label: 'Estado Foto', 
    sortable: true,
    visible: true,
    thClass: 'text-center',
    tdClass: 'text-center'
  },
  { 
    key: 'account_status', 
    label: 'Estado Cuenta', 
    sortable: true,
    visible: true,
    thClass: 'text-center',
    tdClass: 'text-center'
  },
  { 
    key: 'created_at', 
    label: 'Fecha Registro', 
    sortable: true,
    visible: true,
    thClass: 'text-center',
    tdClass: 'text-center'
  },
  { 
    key: 'actions', 
    label: 'Acciones',
    visible: true,
    thClass: 'text-center',
    tdClass: 'text-center'
  }
]
