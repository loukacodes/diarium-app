import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/helpers';
import type { User } from '@/types';

interface ProfileViewProps {
  user: User | null;
  onLogout: () => void;
}

export default function ProfileView({ user, onLogout }: ProfileViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Profile</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Your account information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-base font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-base font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Member since</p>
            <p className="text-base font-medium">
              {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

