import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Phone, MapPin, Camera, ShieldCheck } from 'lucide-react';
import { updateStudentProfile } from '../../services/studentPortalService';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, "Invalid phone number format"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  photoUrl: z.string().url("Please provide a valid image URL").or(z.string().length(0)).optional(),
  guardianName: z.string().min(2, "Guardian name is required"),
  guardianPhone: z.string().regex(/^\+?[\d\s-]{10,}$/, "Invalid guardian phone format"),
  guardianAddress: z.string().min(5, "Guardian address is required"),
  nextOfKinName: z.string().min(2, "Next of Kin name is required"),
  nextOfKinPhone: z.string().regex(/^\+?[\d\s-]{10,}$/, "Invalid Next of Kin phone format"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface Props {
  initialData: any;
  onSuccess: () => void;
}

const ProfileUpdateForm: React.FC<Props> = ({ initialData, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      photoUrl: initialData?.photoUrl || '',
      guardianName: initialData?.guardianName || '',
      guardianPhone: initialData?.guardianPhone || '',
      guardianAddress: initialData?.guardianAddress || '',
      nextOfKinName: initialData?.nextOfKinName || '',
      nextOfKinPhone: initialData?.nextOfKinPhone || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateStudentProfile(data);
      toast.success("Profile updated successfully!");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic & Photo */}
      <div className="bg-white dark:bg-white/[0.03] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <User size={20} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                {...register('phone')}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
                placeholder="+1 234 567 8900"
              />
            </div>
            {errors.phone && <p className="text-xs text-rose-500 font-bold">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Profile Photo URL</label>
            <div className="relative">
              <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                {...register('photoUrl')}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            {errors.photoUrl && <p className="text-xs text-rose-500 font-bold">{String(errors.photoUrl.message)}</p>}
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Current Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-slate-400" size={16} />
              <textarea
                {...register('address')}
                rows={3}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all dark:text-white"
                placeholder="Street address, City, Country"
              />
            </div>
            {errors.address && <p className="text-xs text-rose-500 font-bold">{errors.address.message}</p>}
          </div>
        </div>
      </div>

      {/* Guardian Details */}
      <div className="bg-white dark:bg-white/[0.03] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white">Guardian Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Guardian Name</label>
            <input
              {...register('guardianName')}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
            />
            {errors.guardianName && <p className="text-xs text-rose-500 font-bold">{errors.guardianName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Guardian Phone</label>
            <input
              {...register('guardianPhone')}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
            />
            {errors.guardianPhone && <p className="text-xs text-rose-500 font-bold">{errors.guardianPhone.message}</p>}
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Guardian Address</label>
            <textarea
              {...register('guardianAddress')}
              rows={2}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
            />
            {errors.guardianAddress && <p className="text-xs text-rose-500 font-bold">{errors.guardianAddress.message}</p>}
          </div>
        </div>
      </div>

      {/* Next of Kin (Required) */}
      <div className="bg-rose-50/50 dark:bg-rose-500/5 rounded-3xl p-8 border border-rose-100 dark:border-rose-500/20 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Next of Kin Contact</h3>
              <p className="text-xs text-rose-500 font-medium italic mt-0.5">* Required for portal access</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-rose-400">Contact Name</label>
            <input
              {...register('nextOfKinName')}
              className="w-full bg-white dark:bg-white/5 border border-rose-100 dark:border-rose-500/20 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none dark:text-white"
              placeholder="Primary Emergency Contact"
            />
            {errors.nextOfKinName && <p className="text-xs text-rose-500 font-bold">{errors.nextOfKinName.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-rose-400">Contact Phone</label>
            <input
              {...register('nextOfKinPhone')}
              className="w-full bg-white dark:bg-white/5 border border-rose-100 dark:border-rose-500/20 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-rose-500/20 outline-none dark:text-white"
              placeholder="+1 ..."
            />
            {errors.nextOfKinPhone && <p className="text-xs text-rose-500 font-bold">{errors.nextOfKinPhone.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-white font-black uppercase tracking-widest text-xs px-10 py-4 rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving Changes...' : 'Update Portal Profile'}
        </button>
      </div>
    </form>
  );
};

export default ProfileUpdateForm;
