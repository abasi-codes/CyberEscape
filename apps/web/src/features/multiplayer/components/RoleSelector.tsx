import { useSocket } from '@/hooks/useSocket';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/Select';

interface Props {
  teamId: string;
  userId: string;
  currentRole?: string;
  roles: string[];
  disabled?: boolean;
}

export default function RoleSelector({ teamId, userId, currentRole, roles, disabled }: Props) {
  const { emit } = useSocket();

  const handleChange = (role: string) => {
    emit('team:role:assign', { teamId, userId, role });
  };

  return (
    <Select value={currentRole} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Assign role" />
      </SelectTrigger>
      <SelectContent>
        {roles.map(role => (
          <SelectItem key={role} value={role}>{role}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
