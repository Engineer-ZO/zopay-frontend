"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import {
  useCreateIndividualMerchantAccount,
  useCreateCompanyMerchantAccount,
  useCreateAssociationMerchantAccount,
  useCreateGroupMerchantAccount,
} from "@/features/admin/queries";
import type {
  Base64FileObject,
  CreateMerchantResponse,
  CreateAssociationMerchantRequest,
  CreateCompanyMerchantRequest,
  CreateGroupMerchantRequest,
  CreateIndividualMerchantRequest,
  AssociationOrGroupDocumentRole,
} from "@/features/admin/types";

type MerchantType = "individual" | "company" | "association" | "group";

function toBase64Payload(file: File, base64: string): Base64FileObject {
  return {
    base64,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
  };
}

async function readFileAsBase64(file: File): Promise<Base64FileObject> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(toBase64Payload(file, result));
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function filesToBase64(files: FileList | null, maxFiles: number): Promise<Base64FileObject[]> {
  if (!files || files.length === 0) return [];
  const fileArray = Array.from(files).slice(0, maxFiles);
  return await Promise.all(fileArray.map((f) => readFileAsBase64(f)));
}

export default function CreateMerchantPage() {
  const router = useRouter();

  const [merchantType, setMerchantType] = useState<MerchantType>("individual");
  const [country, setCountry] = useState<string>("CM");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [createdMerchant, setCreatedMerchant] = useState<CreateMerchantResponse["merchant"] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Common
  const [email, setEmail] = useState("");

  // Individual
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [niu, setNiu] = useState<string | undefined>(undefined);
  const [doingBusinessAs, setDoingBusinessAs] = useState("");
  const [passportPhoto, setPassportPhoto] = useState<Base64FileObject | null>(null);
  const [idDocuments, setIdDocuments] = useState<Base64FileObject[]>([]);
  const [businessLogo, setBusinessLogo] = useState<Base64FileObject | null>(null);

  // Company / Association / Group
  const [institutionName, setInstitutionName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [dateOfCreation, setDateOfCreation] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerContact, setManagerContact] = useState("");
  const [managerAddress, setManagerAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [documents, setDocuments] = useState<Base64FileObject[]>([]);
  const [companyAddress, setCompanyAddress] = useState("");

  const documentRole: AssociationOrGroupDocumentRole | null = useMemo(() => {
    if (merchantType === "association") return "ASSOCIATION_DOCUMENT";
    if (merchantType === "group") return "GROUP_DOCUMENT";
    return null;
  }, [merchantType]);

  const createIndividualMutation = useCreateIndividualMerchantAccount();
  const createCompanyMutation = useCreateCompanyMerchantAccount();
  const createAssociationMutation = useCreateAssociationMerchantAccount();
  const createGroupMutation = useCreateGroupMerchantAccount();

  const isSubmitting =
    createIndividualMutation.isPending ||
    createCompanyMutation.isPending ||
    createAssociationMutation.isPending ||
    createGroupMutation.isPending;

  const resetIndividualFiles = () => {
    setPassportPhoto(null);
    setIdDocuments([]);
    setBusinessLogo(null);
  };

  const resetCompanyFiles = () => {
    setDocuments([]);
  };

  const onChangeMerchantType = (type: MerchantType) => {
    setMerchantType(type);
    setEmailError(null);
    // Clear file inputs when switching entity type to avoid accidental reuse.
    resetIndividualFiles();
    resetCompanyFiles();
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "Failed to create merchant.";
  };

  const isEmailConflict = (message: string): boolean => {
    const normalized = message.toLowerCase();
    return normalized.includes("already exists") || normalized.includes("already owns a merchant account");
  };

  const validateAndBuildPayload = (): CreateIndividualMerchantRequest | CreateCompanyMerchantRequest | CreateAssociationMerchantRequest | CreateGroupMerchantRequest => {
    if (!email.trim()) throw new Error("Email is required.");

    if (merchantType === "individual") {
      if (!firstName.trim() || !lastName.trim()) throw new Error("First name and last name are required.");
      if (!dateOfBirth.trim()) throw new Error("Date of birth is required.");
      if (!gender.trim()) throw new Error("Gender is required.");
      if (!phone.trim()) throw new Error("Phone is required.");
      if (!address.trim()) throw new Error("Address is required.");
      if (!idType.trim() || !idNumber.trim()) throw new Error("ID type and ID number are required.");
      if (!doingBusinessAs.trim()) throw new Error("Doing business as is required.");
      if (!passportPhoto) throw new Error("Passport photo is required.");
      if (idDocuments.length < 1) throw new Error("At least 1 ID document is required.");

      return {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim(),
        gender: gender.trim(),
        phone: phone.trim(),
        address: address.trim(),
        idType: idType.trim(),
        idNumber: idNumber.trim(),
        niu: niu?.trim() ? niu.trim() : undefined,
        doingBusinessAs: doingBusinessAs.trim(),
        passportPhoto,
        idDocuments,
        businessLogo: businessLogo ?? null,
        country: country.trim() || undefined,
      };
    }

    if (merchantType === "company") {
      if (!institutionName.trim()) throw new Error("Institution name is required.");
      if (!registrationNumber.trim()) throw new Error("Registration number is required.");
      if (!dateOfCreation.trim()) throw new Error("Date of creation is required.");
      if (!managerName.trim() || !managerContact.trim() || !managerAddress.trim()) {
        throw new Error("Manager name/contact/address are required.");
      }
      if (!companyAddress.trim()) throw new Error("Address is required.");
      if (!contactPhone.trim() || !contactEmail.trim()) throw new Error("Contact phone/email are required.");
      if (documents.length < 1) throw new Error("At least 1 document is required.");

      const payload: CreateCompanyMerchantRequest = {
        email: email.trim(),
        institutionName: institutionName.trim(),
        registrationNumber: registrationNumber.trim(),
        dateOfCreation: dateOfCreation.trim(),
        niu: niu?.trim() ? niu.trim() : undefined,
        managerName: managerName.trim(),
        managerContact: managerContact.trim(),
        managerAddress: managerAddress.trim(),
        address: companyAddress.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        documents,
        country: country.trim() || undefined,
      };

      return payload;
    }

    // Association / Group share the same fields as company.
    // We validate/build the company payload here (no recursion), then attach `documentRole`.
    if (!institutionName.trim()) throw new Error("Institution name is required.");
    if (!registrationNumber.trim()) throw new Error("Registration number is required.");
    if (!dateOfCreation.trim()) throw new Error("Date of creation is required.");
    if (!managerName.trim() || !managerContact.trim() || !managerAddress.trim()) {
      throw new Error("Manager name/contact/address are required.");
    }
    if (!companyAddress.trim()) throw new Error("Address is required.");
    if (!contactPhone.trim() || !contactEmail.trim()) throw new Error("Contact phone/email are required.");
    if (documents.length < 1) throw new Error("At least 1 document is required.");

    const baseCompanyPayload: CreateCompanyMerchantRequest = {
      email: email.trim(),
      institutionName: institutionName.trim(),
      registrationNumber: registrationNumber.trim(),
      dateOfCreation: dateOfCreation.trim(),
      niu: niu?.trim() ? niu.trim() : undefined,
      managerName: managerName.trim(),
      managerContact: managerContact.trim(),
      managerAddress: managerAddress.trim(),
      address: companyAddress.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      documents,
      country: country.trim() || undefined,
    };

    if (!documentRole) throw new Error("Invalid merchant type for document role.");

    if (merchantType === "association") {
      return {
        ...baseCompanyPayload,
        documentRole: "ASSOCIATION_DOCUMENT",
      } as CreateAssociationMerchantRequest;
    }

    return {
      ...baseCompanyPayload,
      documentRole: "GROUP_DOCUMENT",
    } as CreateGroupMerchantRequest;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    try {
      const payload = validateAndBuildPayload();
      let response: CreateMerchantResponse;

      if (merchantType === "individual") {
        response = await createIndividualMutation.mutateAsync(payload as CreateIndividualMerchantRequest);
      } else if (merchantType === "company") {
        response = await createCompanyMutation.mutateAsync(payload as CreateCompanyMerchantRequest);
      } else if (merchantType === "association") {
        response = await createAssociationMutation.mutateAsync(payload as CreateAssociationMerchantRequest);
      } else {
        response = await createGroupMutation.mutateAsync(payload as CreateGroupMerchantRequest);
      }

      setCreatedMerchant(response.merchant);
      setSuccessMessage(response.message);
      toast.success("Merchant created", { description: "Credentials have been sent to the merchant's email." });
    } catch (error) {
      const message = getErrorMessage(error);
      if (isEmailConflict(message)) {
        setEmailError(message);
      }
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            Create Merchant
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            All merchants are created by admins. Temporary credentials are emailed automatically.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Merchant type</label>
          <select
            value={merchantType}
            onChange={(e) => onChangeMerchantType(e.target.value as MerchantType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="individual">Individual</option>
            <option value="company">Company</option>
            <option value="association">Association</option>
            <option value="group">Group</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Email *</label>
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) {
                  setEmailError(null);
                }
              }}
              type="email"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                emailError ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="merchant@example.com"
              required
            />
            {emailError && <p className="text-xs text-red-600">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Country (optional)</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="CM"
            />
          </div>
        </div>

        {merchantType === "individual" && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Individual details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">First name *</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Last name *</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Date of birth *</label>
                <input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Gender *</label>
                <input value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Phone *</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Address *</label>
                <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">ID type *</label>
                <input value={idType} onChange={(e) => setIdType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">ID number *</label>
                <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">NIU (optional)</label>
                <input value={niu ?? ""} onChange={(e) => setNiu(e.target.value || undefined)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Doing business as *</label>
                <input value={doingBusinessAs} onChange={(e) => setDoingBusinessAs(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Passport photo *</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={async (e) => {
                  try {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setPassportPhoto(null);
                      return;
                    }
                    const payload = await readFileAsBase64(file);
                    setPassportPhoto(payload);
                  } catch {
                    toast.error("Failed to read passport photo.");
                  }
                }}
              />
              {passportPhoto && (
                <p className="text-xs text-gray-500">Selected: {passportPhoto.filename}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">ID documents (1..10) *</label>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={async (e) => {
                  try {
                    const payload = await filesToBase64(e.target.files, 10);
                    setIdDocuments(payload);
                    if (e.target.files && e.target.files.length > 10) {
                      toast.warning("Max 10 documents are allowed. Extra files were ignored.");
                    }
                  } catch {
                    toast.error("Failed to read ID documents.");
                  }
                }}
              />
              <p className="text-xs text-gray-500">Selected: {idDocuments.length} file(s)</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Business logo (optional)</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={async (e) => {
                  try {
                    const file = e.target.files?.[0];
                    if (!file) {
                      setBusinessLogo(null);
                      return;
                    }
                    const payload = await readFileAsBase64(file);
                    setBusinessLogo(payload);
                  } catch {
                    toast.error("Failed to read business logo.");
                  }
                }}
              />
            </div>
          </div>
        )}

        {(merchantType === "company" || merchantType === "association" || merchantType === "group") && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Institution details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Institution name *</label>
                <input value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Registration number *</label>
                <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Date of creation *</label>
                <input value={dateOfCreation} onChange={(e) => setDateOfCreation(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">NIU (optional)</label>
                <input value={niu ?? ""} onChange={(e) => setNiu(e.target.value || undefined)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Manager name *</label>
                <input value={managerName} onChange={(e) => setManagerName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Manager contact *</label>
                <input value={managerContact} onChange={(e) => setManagerContact(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Manager address *</label>
                <input value={managerAddress} onChange={(e) => setManagerAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Address *</label>
                <input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Contact phone *</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">Contact email *</label>
                <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">
                Documents (1..10) *{merchantType !== "company" ? " (role required)" : ""}
              </label>
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={async (e) => {
                  try {
                    const payload = await filesToBase64(e.target.files, 10);
                    setDocuments(payload);
                    if (e.target.files && e.target.files.length > 10) {
                      toast.warning("Max 10 documents are allowed. Extra files were ignored.");
                    }
                  } catch {
                    toast.error("Failed to read documents.");
                  }
                }}
              />
              <p className="text-xs text-gray-500">Selected: {documents.length} file(s)</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push("/admin/merchants")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Merchant"
            )}
          </button>
        </div>
      </form>

      {createdMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl max-w-lg w-full">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Merchant Created Successfully</h2>
              <p className="text-sm text-gray-500 mt-1">{successMessage}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Business Name</p>
                <p className="text-sm text-gray-900 mt-1">{createdMerchant.businessName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-sm text-gray-900 mt-1">{createdMerchant.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sandbox API Key</p>
                <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <code className="text-xs break-all text-gray-900">{createdMerchant.sandboxApiKey}</code>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Temporary credentials were emailed automatically. The merchant will be required to change their password on first login.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setCreatedMerchant(null);
                  router.push("/admin/merchants");
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Merchants
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

