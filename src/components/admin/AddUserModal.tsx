import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/logger';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AppRole } from '@/context/AuthContext';
import { Loader2, UserPlus } from 'lucide-react';
 
 interface AddUserModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   defaultRole?: AppRole;
   onUserCreated?: () => void;
 }
 
 export function AddUserModal({ open, onOpenChange, defaultRole = 'user', onUserCreated }: AddUserModalProps) {
   const { toast } = useToast();
   const [formData, setFormData] = useState({
     name: '',
     email: '',
     password: '',
     role: defaultRole,
   });
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [isSubmitting, setIsSubmitting] = useState(false);
 
   const validateForm = () => {
     const newErrors: Record<string, string> = {};
     
     if (!formData.name.trim()) {
       newErrors.name = 'Name is required';
     }
     
     if (!formData.email.trim()) {
       newErrors.email = 'Email is required';
     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
       newErrors.email = 'Invalid email format';
     }
     
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
     
     setErrors(newErrors);
     return Object.keys(newErrors).length === 0;
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!validateForm()) return;
     
     setIsSubmitting(true);
     try {
       const { data: { session } } = await supabase.auth.getSession();
       
       const response = await supabase.functions.invoke('create-user', {
         body: {
           name: formData.name.trim(),
           email: formData.email.trim(),
           password: formData.password,
           role: formData.role,
         },
       });
 
       if (response.error) {
         throw new Error(response.error.message || 'Failed to create user');
       }
 
       if (response.data?.error) {
         throw new Error(response.data.error);
       }
 
       toast({
         title: 'User Created Successfully',
         description: `${formData.name} can now log in immediately.`,
       });
 
       // Reset form
       setFormData({ name: '', email: '', password: '', role: defaultRole });
       setErrors({});
       onOpenChange(false);
       onUserCreated?.();
    } catch (error) {
      logError('Error creating user:', error);
       toast({
         title: 'Error',
         description: error instanceof Error ? error.message : 'Failed to create user',
         variant: 'destructive',
       });
     } finally {
       setIsSubmitting(false);
     }
   };
 
   const handleClose = () => {
     setFormData({ name: '', email: '', password: '', role: defaultRole });
     setErrors({});
     onOpenChange(false);
   };
 
   return (
     <Dialog open={open} onOpenChange={handleClose}>
       <DialogContent className="sm:max-w-md">
         <DialogHeader>
           <DialogTitle className="flex items-center gap-2">
             <UserPlus className="h-5 w-5" />
             Add New {formData.role === 'admin' ? 'Admin' : 'User'}
           </DialogTitle>
         </DialogHeader>
         
         <form onSubmit={handleSubmit} className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="name">Name *</Label>
             <Input
               id="name"
               placeholder="John Doe"
               value={formData.name}
               onChange={(e) => {
                 setFormData({ ...formData, name: e.target.value });
                 if (errors.name) setErrors({ ...errors, name: '' });
               }}
               className={errors.name ? 'border-destructive' : ''}
             />
             {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="email">Email *</Label>
             <Input
               id="email"
               type="email"
               placeholder="john@example.com"
               value={formData.email}
               onChange={(e) => {
                 setFormData({ ...formData, email: e.target.value });
                 if (errors.email) setErrors({ ...errors, email: '' });
               }}
               className={errors.email ? 'border-destructive' : ''}
             />
             {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="password">Password *</Label>
             <Input
               id="password"
               type="password"
               placeholder="••••••••"
               value={formData.password}
               onChange={(e) => {
                 setFormData({ ...formData, password: e.target.value });
                 if (errors.password) setErrors({ ...errors, password: '' });
               }}
               className={errors.password ? 'border-destructive' : ''}
             />
             {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
           </div>
 
           <div className="space-y-2">
             <Label htmlFor="role">Role *</Label>
             <Select
               value={formData.role}
               onValueChange={(value) => setFormData({ ...formData, role: value as AppRole })}
             >
               <SelectTrigger id="role">
                 <SelectValue />
               </SelectTrigger>
               <SelectContent className="bg-popover">
                 <SelectItem value="user">User</SelectItem>
                 <SelectItem value="admin">Admin</SelectItem>
               </SelectContent>
             </Select>
           </div>
 
           <div className="flex gap-2 pt-2">
             <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
               Cancel
             </Button>
             <Button type="submit" disabled={isSubmitting} className="flex-1">
               {isSubmitting ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   Creating...
                 </>
               ) : (
                 <>
                   <UserPlus className="mr-2 h-4 w-4" />
                   Create
                 </>
               )}
             </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
   );
 }