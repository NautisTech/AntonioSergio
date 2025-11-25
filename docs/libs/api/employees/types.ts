// ==================== EMPLOYEE TYPES ====================

export interface Employee {
    id: number
    number?: number
    employeeTypeId?: number
    companyId?: number
    departmentId?: number
    managerId?: number
    fullName: string
    shortName?: string
    jobTitle?: string
    gender: 'male' | 'female' | 'other'
    birthDate: string
    birthplace?: string
    nationality?: string
    maritalStatus?: string
    photoUrl?: string
    hireDate?: string
    employmentStatus?: 'active' | 'on_leave' | 'terminated'
    terminationDate?: string
    notes?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface EmployeeDetail extends Employee {
    contacts?: EmployeeContact[]
    addresses?: EmployeeAddress[]
    benefits?: EmployeeBenefit[]
    documents?: EmployeeDocument[]
}

export interface CreateEmployeeDto {
    number?: number
    employeeTypeId?: number
    companyId?: number
    departmentId?: number
    managerId?: number
    fullName: string
    shortName?: string
    jobTitle?: string
    gender: 'male' | 'female' | 'other'
    birthDate: string
    birthplace?: string
    nationality?: string
    maritalStatus?: string
    photoUrl?: string
    hireDate?: string
    employmentStatus?: 'active' | 'on_leave' | 'terminated'
    notes?: string
}

export interface UpdateEmployeeDto {
    number?: number
    employeeTypeId?: number
    companyId?: number
    departmentId?: number
    managerId?: number
    fullName?: string
    shortName?: string
    jobTitle?: string
    gender?: 'male' | 'female' | 'other'
    birthDate?: string
    birthplace?: string
    nationality?: string
    maritalStatus?: string
    photoUrl?: string
    hireDate?: string
    employmentStatus?: 'active' | 'on_leave' | 'terminated'
    terminationDate?: string
    notes?: string
}

export interface EmployeeListFilters {
    employeeTypeId?: number
    companyId?: number
    departmentId?: number
    employmentStatus?: 'active' | 'on_leave' | 'terminated'
    searchText?: string
    page?: number
    pageSize?: number
}

export interface EmployeeListResponse {
    data: Employee[]
    total: number
    page: number
    pageSize: number
}

export interface EmployeeType {
    id: number
    code: string
    name: string
    description?: string
    createdAt: string
    updatedAt?: string
}

export interface EmployeeStats {
    totalEmployees: number
    activeEmployees: number
    onLeaveEmployees: number
    terminatedEmployees: number
    hiredThisMonth: number
    averageAge?: number
}

// ==================== CONTACT TYPES ====================

export interface EmployeeContact {
    id: number
    employeeId: number
    contactType: 'email' | 'phone' | 'mobile' | 'fax' | 'website' | 'social'
    contactValue: string
    isPrimary: boolean
    isVerified?: boolean
    label?: 'work' | 'personal' | 'home'
    notes?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateContactDto {
    employeeId: number
    contactType: 'email' | 'phone' | 'mobile' | 'fax' | 'website' | 'social'
    contactValue: string
    isPrimary?: boolean
    label?: 'work' | 'personal' | 'home'
    notes?: string
}

export interface UpdateContactDto {
    employeeId?: number
    contactType?: 'email' | 'phone' | 'mobile' | 'fax' | 'website' | 'social'
    contactValue?: string
    isPrimary?: boolean
    label?: 'work' | 'personal' | 'home'
    notes?: string
}

// ==================== ADDRESS TYPES ====================

export interface EmployeeAddress {
    id: number
    employeeId: number
    addressType: 'billing' | 'shipping' | 'mailing' | 'tax' | 'office'
    isPrimary: boolean
    label?: string
    streetLine1: string
    streetLine2?: string
    postalCode?: string
    city?: string
    district?: string
    state?: string
    country: string
    notes?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateAddressDto {
    employeeId: number
    addressType: 'billing' | 'shipping' | 'mailing' | 'tax' | 'office'
    isPrimary?: boolean
    label?: string
    streetLine1: string
    streetLine2?: string
    postalCode?: string
    city?: string
    district?: string
    state?: string
    country: string
    notes?: string
}

export interface UpdateAddressDto {
    employeeId?: number
    addressType?: 'billing' | 'shipping' | 'mailing' | 'tax' | 'office'
    isPrimary?: boolean
    label?: string
    streetLine1?: string
    streetLine2?: string
    postalCode?: string
    city?: string
    district?: string
    state?: string
    country?: string
    notes?: string
}

// ==================== BENEFIT TYPES ====================

export interface EmployeeBenefit {
    id: number
    employeeId: number
    benefitType: string
    provider?: string
    policyNumber?: string
    startDate: string
    endDate?: string
    monthlyCost?: number
    employeeContribution?: number
    companyContribution?: number
    notes?: string
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateBenefitDto {
    employeeId: number
    benefitType: string
    provider?: string
    policyNumber?: string
    startDate: string
    endDate?: string
    monthlyCost?: number
    employeeContribution?: number
    companyContribution?: number
    notes?: string
}

export interface UpdateBenefitDto {
    employeeId?: number
    benefitType?: string
    provider?: string
    policyNumber?: string
    startDate?: string
    endDate?: string
    monthlyCost?: number
    employeeContribution?: number
    companyContribution?: number
    notes?: string
}

// ==================== DOCUMENT TYPES ====================

export interface EmployeeDocument {
    id: number
    employeeId: number
    documentType: string
    documentNumber?: string
    title: string
    description?: string
    filePath: string
    fileName: string
    fileSize?: number
    mimeType?: string
    issueDate?: string
    expiryDate?: string
    isConfidential: boolean
    createdAt: string
    updatedAt?: string
    deletedAt?: string
}

export interface CreateDocumentDto {
    employeeId: number
    documentType: string
    documentNumber?: string
    title: string
    description?: string
    filePath: string
    fileName: string
    fileSize?: number
    mimeType?: string
    issueDate?: string
    expiryDate?: string
    isConfidential?: boolean
}

export interface UpdateDocumentDto {
    employeeId?: number
    documentType?: string
    documentNumber?: string
    title?: string
    description?: string
    filePath?: string
    fileName?: string
    fileSize?: number
    mimeType?: string
    issueDate?: string
    expiryDate?: string
    isConfidential?: boolean
}
