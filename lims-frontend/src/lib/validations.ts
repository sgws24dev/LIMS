import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})
export type LoginForm = z.infer<typeof loginSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

const passwordValidations = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must include at least one uppercase letter")
  .regex(/[a-z]/, "Must include at least one lowercase letter")
  .regex(/[0-9]/, "Must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Must include at least one special character")

export const resetPasswordSchema = z
  .object({
    newPassword: passwordValidations,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordValidations,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  })
export type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export const mfaVerificationSchema = z.object({
  code: z.string().length(6, "Code must be exactly 6 digits"),
})
export type MfaVerificationForm = z.infer<typeof mfaVerificationSchema>

const phoneRegex = /^[\d\s+\-()]{7,15}$/
const emailField = z.string().email("Invalid email format").or(z.literal(""))

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  role: z.string().min(1, "Role is required"),
  branchId: z.string().optional(),
  password: passwordValidations,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})
export type CreateUserForm = z.infer<typeof createUserSchema>

export const editUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  role: z.string().min(1, "Role is required"),
  branchId: z.string().optional(),
  isActive: z.boolean(),
})
export type EditUserForm = z.infer<typeof editUserSchema>

export const createPatientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailField.optional().or(z.literal("")),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.string().min(1, "Blood group is required"),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().optional(),
  medicalHistory: z.array(z.string()).optional(),
  familyMembers: z.array(z.object({
    id: z.string(),
    name: z.string().optional(),
    relation: z.string().optional(),
    phone: z.string().optional(),
    dob: z.string().optional(),
  })).optional(),
})
export type CreatePatientForm = z.infer<typeof createPatientSchema>

export const editPatientSchema = createPatientSchema
export type EditPatientForm = CreatePatientForm

export const createDoctorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  specialization: z.string().min(1, "Specialization is required"),
  hospital: z.string().min(1, "Hospital is required"),
  city: z.string().min(1, "City is required"),
  commission: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
    message: "Commission must be a valid non-negative number",
  }),
})
export type CreateDoctorForm = z.infer<typeof createDoctorSchema>

export const editDoctorSchema = createDoctorSchema.extend({
  isActive: z.boolean(),
})
export type EditDoctorForm = z.infer<typeof editDoctorSchema>

export const createBranchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  code: z.string().min(1, "Branch code is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  email: z.string().email("Invalid email format"),
})
export type CreateBranchForm = z.infer<typeof createBranchSchema>

export const editBranchSchema = createBranchSchema.extend({
  isActive: z.boolean(),
})
export type EditBranchForm = z.infer<typeof editBranchSchema>

export const testCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
})
export type TestCategoryForm = z.infer<typeof testCategorySchema>

export const testPackageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  code: z.string().min(1, "Package code is required"),
  description: z.string().optional(),
  price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: "Price must be a positive number",
  }),
  discountedPrice: z.string().optional(),
  tests: z.array(z.string()).min(1, "Select at least one test"),
})
export type TestPackageForm = z.infer<typeof testPackageSchema>

export const sampleRegistrationSchema = z.object({
  selectedBookingId: z.string().min(1, "Booking is required"),
  selectedTest: z.string().min(1, "Test is required"),
  container: z.string().min(1, "Container is required"),
  volume: z.string().optional(),
  barcode: z.string().min(1, "Barcode is required"),
  notes: z.string().optional(),
})
export type SampleRegistrationForm = z.infer<typeof sampleRegistrationSchema>

export const instrumentConfigSchema = z.object({
  ipAddress: z.string().min(1, "IP address is required").regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, "Invalid IP address format"),
  port: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0 && Number(v) < 65536, {
    message: "Port must be between 1 and 65535",
  }),
  protocol: z.string().min(1, "Protocol is required"),
})
export type InstrumentConfigForm = z.infer<typeof instrumentConfigSchema>

export const reportBrandingSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  headerColor: z.string().optional(),
  fontFamily: z.string().optional(),
  showQR: z.boolean().optional(),
  showPatientSummary: z.boolean().optional(),
  showAIInterpretation: z.boolean().optional(),
  footer: z.string().optional(),
  isDefault: z.boolean().optional(),
})
export type ReportBrandingForm = z.infer<typeof reportBrandingSchema>

export const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  code: z.string().min(1, "Department code is required"),
  head: z.string().optional(),
  description: z.string().optional(),
})
export type DepartmentForm = z.infer<typeof departmentSchema>

export const walkInRegistrationSchema = z.object({
  name: z.string().min(1, "Patient name is required"),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  email: emailField.optional().or(z.literal("")),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female", "other"]),
  address: z.string().optional(),
  selectedTests: z.array(z.string()).min(1, "Select at least one test"),
  selectedDoctor: z.string().optional(),
  collectionType: z.enum(["lab", "home"]),
  homeAddress: z.string().optional(),
  discount: z.string().optional(),
  paidAmount: z.string().optional(),
  branchId: z.string().min(1, "Branch is required"),
})
export type WalkInRegistrationForm = z.infer<typeof walkInRegistrationSchema>

export const resultEntrySchema = z.object({
  notes: z.string().optional(),
  parameterValues: z.record(z.string(), z.string()).optional(),
})
export type ResultEntryForm = z.infer<typeof resultEntrySchema>

export const generalSettingsSchema = z.object({
  labName: z.string().min(1, "Laboratory name is required"),
  registrationNo: z.string().min(1, "Registration number is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  email: z.string().email("Invalid email format"),
  website: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  dateFormat: z.string().min(1, "Date format is required"),
  defaultLanguage: z.string().min(1, "Language is required"),
  footerText: z.string().optional(),
  signature: z.string().optional(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  whatsappNotifications: z.boolean(),
  sessionTimeout: z.number().min(5).max(120),
  minPasswordLength: z.number().min(6).max(32),
  requireSpecialChars: z.boolean(),
  twoFactorEnabled: z.boolean(),
})
export type GeneralSettingsForm = z.infer<typeof generalSettingsSchema>

export const purchaseOrderSchema = z.object({
  vendor: z.string().min(1, "Vendor is required"),
  expectedDelivery: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Price must be non-negative"),
    total: z.number(),
  })).min(1, "At least one item is required"),
})
export type PurchaseOrderForm = z.infer<typeof purchaseOrderSchema>

export const stockAdjustmentSchema = z.object({
  type: z.enum(["add", "remove"]),
  quantity: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
    message: "Quantity must be a positive number",
  }),
  reason: z.string().min(1, "Reason is required"),
})
export type StockAdjustmentForm = z.infer<typeof stockAdjustmentSchema>
