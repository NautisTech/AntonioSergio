// ==================== MENU TYPES ====================

export interface MenuItem {
  label: string
  icon: string
  href: string
}

export interface MenuSection {
  label: string
  children: MenuItem[]
}

export interface MenuResponse {
  sections: MenuSection[]
  userModules: string[]
  userPermissions: string[]
}
