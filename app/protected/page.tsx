import { createClient } from '@/utils/supabase/server';
import { InfoIcon, Settings, Plus, Edit, Trash2, Users } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getBatchInfo,
  getAllBatchInfo,
  getUserProfile,
  getBatches,
  upsertBatchInfo,
  deleteBatchInfo
} from './actions';
import BatchInfoForm from './components/BatchInfoForm';
import BatchInfoDisplay from './components/BatchInfoDisplay';
import DeleteBatchInfoButton from './components/DeleteBatchInfoButton';

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in');
  }

  // Check if user is admin (staff role)
  const isAdmin =
    user?.app_metadata?.role === 'admin' ||
    user?.user_metadata?.role === 'admin' ||
    user?.app_metadata?.is_admin === true ||
    user?.user_metadata?.is_admin === true;

  // Get user profile to check role and batch
  const userProfile = await getUserProfile();
  const isStaff = userProfile?.role === 'STAFF';
  const isTrainee = userProfile?.role === 'TRAINEE';
  const isTrainer = userProfile?.role === 'TRAINER';

  // If user is admin or staff, show batch management interface
  if (isAdmin || isStaff) {
    const allBatchInfo = await getAllBatchInfo();
    const batches = await getBatches();

    return (
      <div className="flex-1 w-full flex flex-col gap-8 p-6">
        <div className="w-full">
          <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
            <Settings size="16" strokeWidth={2} />
            Admin Dashboard - Manage batch information for all training groups
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Batch Information Management Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus size="20" />
                Manage Batch Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BatchInfoForm
                batches={batches}
                upsertBatchInfo={upsertBatchInfo}
              />
            </CardContent>
          </Card>

          {/* Existing Batch Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size="20" />
                Current Batch Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {allBatchInfo.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <InfoIcon size="48" className="mx-auto mb-4 opacity-50" />
                  <p>No batch information has been created yet.</p>
                  <p className="text-sm">
                    Use the form to add information for your batches.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {allBatchInfo.map((info: any) => (
                    <div key={info.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{info.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {info.batchName || `Batch ${info.batchId}`}
                          </Badge>
                        </div>
                        <DeleteBatchInfoButton
                          batchId={info.batchId}
                          deleteBatchInfo={deleteBatchInfo}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {info.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Updated: {info.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // For regular users (trainees/trainers), show batch-specific information
  if (isTrainee && userProfile?.batch_id) {
    const batchInfo = await getBatchInfo(userProfile.batch_id);

    return (
      <div className="flex-1 w-full flex flex-col gap-8 p-6">
        <div className="w-full">
          <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} />
            Welcome to your training batch:{' '}
            {userProfile.batch?.name || 'Your Batch'}
          </div>
        </div>

        {batchInfo ? (
          <BatchInfoDisplay batchInfo={batchInfo} userProfile={userProfile} />
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <InfoIcon
                  size="48"
                  className="mx-auto mb-4 text-muted-foreground opacity-50"
                />
                <h3 className="text-lg font-semibold mb-2">
                  No Information Available
                </h3>
                <p className="text-muted-foreground">
                  Your training coordinators haven't posted any information for
                  your batch yet.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check back later for updates, announcements, and important
                  information.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (isTrainer) {
    // For trainers, show information for batches they train
    return (
      <div className="flex-1 w-full flex flex-col gap-8 p-6">
        <div className="w-full">
          <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} />
            Trainer Dashboard - View information for your training batches
          </div>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users
                size="48"
                className="mx-auto mb-4 text-muted-foreground opacity-50"
              />
              <h3 className="text-lg font-semibold mb-2">
                Trainer Information
              </h3>
              <p className="text-muted-foreground">
                Batch information for trainers is coming soon.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact your training coordinator for batch-specific
                information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback for users without proper role assignment
  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
        </div>
      </div>

      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <InfoIcon
              size="48"
              className="mx-auto mb-4 text-muted-foreground opacity-50"
            />
            <h3 className="text-lg font-semibold mb-2">
              Account Setup Required
            </h3>
            <p className="text-muted-foreground">
              Your account needs to be configured with a role and batch
              assignment.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact your training coordinator to complete your account
              setup.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
