'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Loader2,
  Send,
  CheckCircle,
  XCircle,
  Copy,
  Mail,
  MailCheck,
  AlertCircle
} from 'lucide-react';
import {
  createToken,
  createTokenAndSendEmail,
  sendSignupEmail,
  getTokens,
  getBatches
} from '@/app/staff/tokens/actions';
import { SignupToken } from '@/types/auth';
import { formatDistance } from 'date-fns';
import { toast } from 'sonner';

// Type for batches
type Batch = {
  id: string;
  name: string;
  type: string;
};

export default function TokenManagement() {
  const [email, setEmail] = useState('');
  const [batchId, setBatchId] = useState('');
  const [sendEmail, setSendEmail] = useState(true); // Default to sending email
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokens, setTokens] = useState<SignupToken[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newToken, setNewToken] = useState<SignupToken | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sendingEmailFor, setSendingEmailFor] = useState<string | null>(null);

  // Load tokens and batches on page load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [fetchedTokens, fetchedBatches] = await Promise.all([
          getTokens(),
          getBatches()
        ]);
        setTokens(fetchedTokens);
        setBatches(fetchedBatches);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle token creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId) {
      toast.error('Please select a batch');
      return;
    }
    setIsSubmitting(true);
    setNewToken(null);
    setEmailSent(false);
    setEmailError(null);

    try {
      if (sendEmail) {
        // Create token and send email
        const result = await createTokenAndSendEmail(email, batchId);
        if (result.token) {
          setNewToken(result.token);
          setEmailSent(result.emailSent);
          if (result.error) {
            setEmailError(result.error);
            toast.warning(result.error);
          } else if (result.emailSent) {
            toast.success(
              'Token created and invitation email sent successfully!'
            );
          }
        } else {
          toast.error(result.error || 'Failed to create token');
        }
      } else {
        // Create token only (no email)
        const token = await createToken(email, batchId);
        if (token) {
          setNewToken(token);
          toast.success(
            'Token created successfully! You can send the invitation email later.'
          );
        } else {
          toast.error('Failed to create token');
        }
      }

      // Refresh tokens list
      const updatedTokens = await getTokens();
      setTokens(updatedTokens);
      setEmail('');
      setBatchId('');
    } catch (error) {
      console.error('Failed to create token:', error);
      toast.error('Failed to create token');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send email for existing token
  const handleSendEmail = async (tokenId: string) => {
    setSendingEmailFor(tokenId);
    try {
      const result = await sendSignupEmail(tokenId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      toast.error('Failed to send email');
    } finally {
      setSendingEmailFor(null);
    }
  };

  // Copy registration link to clipboard
  const copyToClipboard = () => {
    if (!newToken) return;

    const baseUrl = window.location.origin;
    const registrationLink = `${baseUrl}/sign-up?token=${newToken.token}`;

    navigator.clipboard
      .writeText(registrationLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        toast.success('Registration link copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        toast.error('Failed to copy link');
      });
  };

  // Format expiration date relative to now
  const formatExpiration = (date: Date) => {
    try {
      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get batch name by ID
  const getBatchName = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    return batch ? `${batch.name} (${batch.type})` : 'Unknown Batch';
  };

  const handleBatchChange = (value: string) => {
    setBatchId(value);
  };

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-8">HR Token Management</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Create Token Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Invitation Token</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Trainee Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="trainee@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch">Select Batch</Label>
                <Select
                  onValueChange={handleBatchChange}
                  value={batchId}
                  required
                >
                  <SelectTrigger id="batch">
                    <SelectValue placeholder="Choose a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map(batch => (
                      <SelectItem key={batch.id} value={batch.id.toString()}>
                        {batch.name} ({batch.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send-email"
                  checked={sendEmail}
                  onCheckedChange={checked => setSendEmail(checked as boolean)}
                />
                <Label
                  htmlFor="send-email"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Send invitation email immediately
                </Label>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {sendEmail ? 'Creating & Sending...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {sendEmail ? 'Create Token & Send Email' : 'Create Token'}
                  </>
                )}
              </Button>
            </form>

            {/* New Token Created */}
            {newToken && (
              <div className="mt-6 p-4 border rounded-md bg-muted">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">New Token Created</h3>
                  {emailSent && (
                    <div className="flex items-center text-green-600 text-xs">
                      <MailCheck className="h-3 w-3 mr-1" />
                      Email Sent
                    </div>
                  )}
                  {emailError && (
                    <div className="flex items-center text-amber-600 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Email Failed
                    </div>
                  )}
                </div>
                <p className="text-sm mb-2">
                  Token for <strong>{newToken.email}</strong>
                </p>
                <p className="text-sm mb-2">
                  Batch: <strong>{getBatchName(newToken.batchId)}</strong>
                </p>
                <p className="text-sm mb-4">
                  Expires {formatExpiration(newToken.expiresAt)}
                </p>

                {emailError && (
                  <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                    {emailError}
                  </div>
                )}

                <div className="flex items-center justify-between bg-card p-2 rounded">
                  <p className="text-xs truncate w-56">
                    {window.location.origin}/sign-up?token={newToken.token}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {!emailSent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendEmail(newToken.id)}
                        disabled={sendingEmailFor === newToken.id}
                      >
                        {sendingEmailFor === newToken.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tokens List */}
        <Card>
          <CardHeader>
            <CardTitle>Active Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : tokens.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No tokens found
              </p>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map(token => (
                      <TableRow key={token.id}>
                        <TableCell className="font-medium">
                          {token.email}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {getBatchName(token.batchId)}
                        </TableCell>
                        <TableCell>
                          {token.isUsed ? (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full flex items-center w-fit">
                              <CheckCircle className="h-3 w-3 mr-1" /> Used
                            </span>
                          ) : new Date(token.expiresAt) < new Date() ? (
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-500 rounded-full flex items-center w-fit">
                              <XCircle className="h-3 w-3 mr-1" /> Expired
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded-full flex items-center w-fit">
                              Active
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(token.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatExpiration(token.expiresAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const baseUrl = window.location.origin;
                                const registrationLink = `${baseUrl}/sign-up?token=${token.token}`;
                                navigator.clipboard
                                  .writeText(registrationLink)
                                  .then(() =>
                                    toast.success('Link copied to clipboard')
                                  )
                                  .catch(() =>
                                    toast.error('Failed to copy link')
                                  );
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            {!token.isUsed &&
                              new Date(token.expiresAt) > new Date() && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSendEmail(token.id)}
                                  disabled={sendingEmailFor === token.id}
                                  title="Send invitation email"
                                >
                                  {sendingEmailFor === token.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Mail className="h-3 w-3" />
                                  )}
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
