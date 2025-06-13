import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Copy, Mail } from 'lucide-react';
import { toast } from 'sonner';

// Types
import { SignupToken } from '@/types/auth';

type Batch = {
  id: string;
  name: string;
  type: string;
};

type TokenListProps = {
  tokens: SignupToken[];
  batches: Batch[];
  isLoading: boolean;
  sendingEmailFor: string | null;
  handleSendEmail: (tokenId: string) => void;
  formatExpiration: (date: Date) => string;
};

export default function TokenList({
  tokens,
  batches,
  isLoading,
  sendingEmailFor,
  handleSendEmail,
  formatExpiration
}: TokenListProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Helper to get batch name
  const getBatchName = (batchId: string) => {
    const batch = batches.find(b => b.id === batchId);
    return batch ? `${batch.name} (${batch.type})` : 'Unknown Batch';
  };

  // Filtered tokens based on search
  const filteredTokens = useMemo(() => {
    const lower = search.toLowerCase();
    return tokens.filter(token => {
      const emailMatch = token.email.toLowerCase().includes(lower);
      const batch = getBatchName(token.batchId).toLowerCase();
      const batchMatch = batch.includes(lower);
      return emailMatch || batchMatch;
    });
  }, [tokens, search, batches]);

  // Pagination
  const totalPages = Math.ceil(filteredTokens.length / pageSize);
  const paginatedTokens = filteredTokens.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Copy registration link
  const handleCopy = (token: SignupToken) => {
    const baseUrl = window.location.origin;
    const registrationLink = `${baseUrl}/sign-up?token=${token.token}`;
    navigator.clipboard
      .writeText(registrationLink)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Tokens</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4 gap-2">
          <Input
            placeholder="Search by email or batch..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="max-w-xs"
          />
        </div>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTokens.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No tokens found
          </p>
        ) : (
          <>
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
                  {paginatedTokens.map(token => (
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
                            onClick={() => handleCopy(token)}
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
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
