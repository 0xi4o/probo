import { Building2, Upload, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Suspense, useEffect, useState, useRef } from "react";
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  useQueryLoader,
  useMutation,
} from "react-relay";
import { useParams } from "react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SettingsViewQuery as SettingsViewQueryType } from "./__generated__/SettingsViewQuery.graphql";
import type { SettingsViewUpdateOrganizationMutation as SettingsViewUpdateOrganizationMutationType } from "./__generated__/SettingsViewUpdateOrganizationMutation.graphql";
import type { SettingsViewInviteUserMutation as SettingsViewInviteUserMutationType } from "./__generated__/SettingsViewInviteUserMutation.graphql";
import type { SettingsViewRemoveUserMutation as SettingsViewRemoveUserMutationType } from "./__generated__/SettingsViewRemoveUserMutation.graphql";
import { PageTemplate } from "@/components/PageTemplate";
import { SettingsViewSkeleton } from "./SettingsPage";

const settingsViewQuery = graphql`
  query SettingsViewQuery($organizationID: ID!) {
    organization: node(id: $organizationID) {
      id
      ... on Organization {
        name
        logoUrl
        users(first: 100) {
          edges {
            node {
              id
              fullName
              email
              createdAt
            }
          }
        }
      }
    }
  }
`;

const updateOrganizationMutation = graphql`
  mutation SettingsViewUpdateOrganizationMutation(
    $input: UpdateOrganizationInput!
  ) {
    updateOrganization(input: $input) {
      organization {
        id
        name
        logoUrl
      }
    }
  }
`;

const inviteUserMutation = graphql`
  mutation SettingsViewInviteUserMutation($input: InviteUserInput!) {
    inviteUser(input: $input) {
      success
    }
  }
`;

const removeUserMutation = graphql`
  mutation SettingsViewRemoveUserMutation($input: RemoveUserInput!) {
    removeUser(input: $input) {
      success
    }
  }
`;

function SettingsViewContent({
  queryRef,
}: {
  queryRef: PreloadedQuery<SettingsViewQueryType>;
}) {
  const data = usePreloadedQuery(settingsViewQuery, queryRef);
  const organization = data.organization;
  const users = organization.users?.edges.map((edge) => edge.node) || [];
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFullName, setInviteFullName] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [organizationName, setOrganizationName] = useState(
    organization.name || ""
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const [updateOrganization] =
    useMutation<SettingsViewUpdateOrganizationMutationType>(
      updateOrganizationMutation
    );

  const [inviteUser] =
    useMutation<SettingsViewInviteUserMutationType>(inviteUserMutation);

  const [removeUser] =
    useMutation<SettingsViewRemoveUserMutationType>(removeUserMutation);

  const { organizationId } = useParams();
  const [, loadQuery] =
    useQueryLoader<SettingsViewQueryType>(settingsViewQuery);

  const handleUpdateName = () => {
    updateOrganization({
      variables: {
        input: {
          organizationId: organization.id,
          name: organizationName,
        },
      },
      onCompleted: () => {
        toast({
          title: "Organization updated",
          description: "Organization name has been updated successfully.",
          variant: "default",
        });
        setIsEditNameOpen(false);
      },
      onError: (error) => {
        toast({
          title: "Error updating organization",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a FileReader to read the file as a data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setIsUploading(true);

      updateOrganization({
        variables: {
          input: {
            organizationId: organization.id,
            logo: null,
          },
        },
        uploadables: {
          "input.logo": file,
        },
        onCompleted: () => {
          setIsUploading(false);
          toast({
            title: "Logo updated",
            description: "Organization logo has been updated successfully.",
            variant: "default",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
        onError: (error) => {
          setIsUploading(false);
          toast({
            title: "Error updating logo",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const handleInviteMember = () => {
    if (!inviteEmail || !inviteFullName) {
      toast({
        title: "Missing information",
        description:
          "Please provide both email and full name for the invitation",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);

    inviteUser({
      variables: {
        input: {
          organizationId: organization.id,
          email: inviteEmail,
          fullName: inviteFullName,
        },
      },
      onCompleted: (response) => {
        setIsInviting(false);
        if (response.inviteUser?.success) {
          toast({
            title: "Invitation sent",
            description: `An invitation has been sent to ${inviteEmail}`,
            variant: "default",
          });
          setIsInviteOpen(false);
          setInviteEmail("");
          setInviteFullName("");
        } else {
          toast({
            title: "Error sending invitation",
            description: "The invitation could not be sent. Please try again.",
            variant: "destructive",
          });
        }
      },
      onError: (error) => {
        setIsInviting(false);
        toast({
          title: "Error sending invitation",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleRemoveUser = (userId: string) => {
    setIsRemoving(true);

    removeUser({
      variables: {
        input: {
          organizationId: organization.id,
          userId: userId,
        },
      },
      onCompleted: (response) => {
        setIsRemoving(false);
        if (response.removeUser?.success) {
          toast({
            title: "User removed",
            description: "The user has been removed from the organization.",
            variant: "default",
          });
          // Refresh the query to update the UI
          loadQuery({ organizationID: organizationId! });
        } else {
          toast({
            title: "Error removing user",
            description: "The user could not be removed. Please try again.",
            variant: "destructive",
          });
        }
      },
      onError: (error) => {
        setIsRemoving(false);
        toast({
          title: "Error removing user",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <PageTemplate
      title="Settings"
      description="Manage your details and personal preferences here"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization information</CardTitle>
            <CardDescription>Manage your organization details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization logo</label>
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
                <div className="flex items-center gap-3">
                  {organization.logoUrl ? (
                    <img
                      src={organization.logoUrl}
                      alt="Logo"
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border">
                      <Upload className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-muted-foreground">
                    Upload a logo to be displayed at the top of your trust page
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Change image"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Organization name</label>
              <div className="flex items-center justify-between rounded-lg border p-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Set the name of the organization
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{organization.name}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOrganizationName(organization.name || "");
                      setIsEditNameOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Workspace members</CardTitle>
              <CardDescription>
                Manage who has privileged access to your workspace and their
                permissions.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInviteOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Invite member
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">No members found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You haven&apos;t added any members to your workspace yet.
                  </p>
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg border p-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.fullName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.fullName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Owner
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleRemoveUser(user.id)}
                            disabled={isRemoving}
                          >
                            {isRemoving ? "Removing..." : "Remove member"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditNameOpen} onOpenChange={setIsEditNameOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Organization Name</DialogTitle>
            <DialogDescription>
              Update the name of your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="organization-name">Organization Name</Label>
              <Input
                id="organization-name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Enter organization name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditNameOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateName}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={inviteFullName}
                onChange={(e) => setInviteFullName(e.target.value)}
                placeholder="Enter full name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInviteMember} disabled={isInviting}>
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}

export default function SettingsView() {
  const [queryRef, loadQuery] =
    useQueryLoader<SettingsViewQueryType>(settingsViewQuery);

  const { organizationId } = useParams();

  useEffect(() => {
    loadQuery({ organizationID: organizationId! });
  }, [loadQuery, organizationId]);

  if (!queryRef) {
    return <SettingsViewSkeleton />;
  }

  return (
    <Suspense fallback={<SettingsViewSkeleton />}>
      <SettingsViewContent queryRef={queryRef} />
    </Suspense>
  );
}
