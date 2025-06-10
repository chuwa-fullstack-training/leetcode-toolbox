import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, BookOpen } from 'lucide-react';
import { BatchInfo } from '@/lib/types';

interface BatchInfoDisplayProps {
  batchInfo: BatchInfo;
  userProfile: any; // User profile with batch information
}

function getBatchTypeDisplay(type: string): string {
  switch (type) {
    case 'js-fullstack':
      return 'JavaScript Fullstack';
    case 'java-backend':
      return 'Java Backend';
    case 'ai-ml':
      return 'AI/ML';
    default:
      return type;
  }
}

function getBatchBadgeVariant(
  type: string
): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'js-fullstack':
      return 'default';
    case 'java-backend':
      return 'secondary';
    case 'ai-ml':
      return 'outline';
    default:
      return 'default';
  }
}

export default function BatchInfoDisplay({
  batchInfo,
  userProfile
}: BatchInfoDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Batch Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                {userProfile.batch?.name || 'Your Batch'}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getBatchBadgeVariant(userProfile.batch?.type)}>
                  {getBatchTypeDisplay(userProfile.batch?.type)}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {userProfile.firstname} {userProfile.lastname}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Member since{' '}
                {new Date(
                  userProfile.created_at || Date.now()
                ).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Batch Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size="20" />
            {batchInfo.title}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Last updated: {batchInfo.updatedAt.toLocaleDateString()} at{' '}
            {batchInfo.updatedAt.toLocaleTimeString()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-foreground">
              {batchInfo.content}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              This information is specific to your training batch. If you have
              questions, please contact your training coordinator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
