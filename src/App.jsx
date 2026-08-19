import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AuthCallback from './pages/AuthCallback';
import AcceptInvite from './pages/AcceptInvite';
import { EventProvider } from './context/EventContext';
import { BranchProvider } from './context/BranchContext';
import { CouncilProvider } from './context/CouncilContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { BusinessProvider } from './context/BusinessContext';
import * as P from './routes/lazyPages';

const PageLoader = () => (
  <div className="min-h-screen bg-[#FFF9F1] dark:bg-brand-darkBg flex items-center justify-center">
    <div className="text-center">
      <p className="text-brand-orange text-2xl font-bold mb-2">Kincore</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
    </div>
  </div>
);
function OAuthSync() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/accept-invite') || location.pathname.includes('/reset-password') || location.pathname.includes('/auth/callback')) {
      return;
    }

    const hasOAuthParams = location.hash.includes('access_token') || location.search.includes('code');
    if (location.pathname === '/' && !hasOAuthParams && !localStorage.getItem('token')) {
      return;
    }

    const syncOAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.access_token) {
        const hasOAuthParams = location.hash.includes('access_token') || location.search.includes('code');
        const existingToken = localStorage.getItem('token');
        if (!existingToken || hasOAuthParams) {
          try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
            const response = await fetch(`${baseUrl}/auth/oauth-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                access_token: session.access_token,
                email: session.user?.email,
                client_type: 'web'
              })
            });
            if (response.ok) {
              const data = await response.json();
              localStorage.setItem('token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              const familyId =
                data.user.family_id
                || data.user.family_space_id
                || data.user.spaces?.[0]?.id
                || null;
              if (familyId) {
                localStorage.setItem('selected_family_id', familyId);
                localStorage.setItem('currentFamilySpaceId', familyId);
                if (!data.user.family_id) {
                  localStorage.setItem('user', JSON.stringify({ ...data.user, family_id: familyId }));
                }
              }
              const role = (data.user.role || '').toLowerCase();
              if (role === 'owner') navigate('/owner/dashboard', { replace: true });
              else if (role === 'branch-admin' || role === 'branch admin' || role === 'branch_admin' || role === 'branch') navigate('/branch/dashboard', { replace: true });
              else if (role === 'council' || role === 'editor' || role === 'council-admin' || role === 'council admin') navigate('/council/dashboard', { replace: true });
              else if (role === 'family-admin' || role === 'family admin' || role === 'family_admin' || role === 'family' || role === 'admin') navigate('/dashboard', { replace: true });
              else if (role === 'business') navigate('/business/dashboard', { replace: true });
              else if (role === 'devops') navigate('/devops/dashboard', { replace: true });
              else if (role === 'auditor') navigate('/auditor/dashboard', { replace: true });
              else navigate('/dashboard', { replace: true });
            }
          } catch (err) {
            console.error('OAuth backend sync error:', err);
          }
        }
      }
    };
    syncOAuth();
  }, [location, navigate]);

  return null;
}

function App() {
  return (
    <CouncilProvider>
      <Router>
        <OAuthSync />
        <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />

        {/* Family Hub Routes */}
        <Route path="/dashboard" element={<P.Layout><P.AdminDashboard /></P.Layout>} />
        <Route path="/governance" element={<P.Layout><P.GovernanceRoles /></P.Layout>} />
        <Route path="/governance/add-role" element={<P.Layout><P.AddRole /></P.Layout>} />
        <Route path="/content-moderation" element={<P.Layout><P.ContentModeration /></P.Layout>} />
        <Route path="/lineage-registry" element={<P.Layout><P.LineageRegistry /></P.Layout>} />

        <Route path="/restrict-author" element={<P.Layout><P.RestrictAuthor /></P.Layout>} />
        <Route path="/member-registry" element={<P.Layout><P.MemberRegistry /></P.Layout>} />
        <Route path="/events" element={<P.Layout><P.EventsEngagement /></P.Layout>} />
        <Route path="/admin/events/:id" element={<P.Layout><P.EventDetails /></P.Layout>} />
        <Route path="/events/create" element={<EventProvider><P.Layout><P.CreateEvent /></P.Layout></EventProvider>} />
        <Route path="/events/secret-santa/preview" element={<EventProvider><P.Layout><P.SecretSantaPreview /></P.Layout></EventProvider>} />
        <Route path="/events/secret-santa/locked" element={<EventProvider><P.Layout><P.SecretSantaLocked /></P.Layout></EventProvider>} />
        <Route path="/mall" element={<P.Layout><P.Mall /></P.Layout>} />
        <Route path="/media" element={<P.Layout><P.MediaRepository /></P.Layout>} />
        <Route path="/subscription" element={<P.Layout><P.Subscription /></P.Layout>} />
        <Route path="/subscription/features" element={<P.Layout><P.PlanFeatures /></P.Layout>} />
        <Route path="/migration" element={<P.Layout><P.MigrationMap /></P.Layout>} />
        <Route path="/migration/add" element={<P.Layout><P.CreateMigrationPoint /></P.Layout>} />
        <Route path="/migration-map/webview/:familySpaceId" element={<P.MigrationMapWebview />} />
        <Route path="/family-tree/webview" element={<P.FamilyTree />} />
        <Route path="/family-tree/webview/:familySpaceId" element={<P.FamilyTree />} />
        <Route path="/family-tree/webview/:familySpaceId/add-child" element={<P.AddChild />} />
        <Route path="/family-tree/webview/:familySpaceId/add-parent" element={<P.AddParents />} />
        <Route path="/family-tree/webview/:familySpaceId/add-member" element={<P.AddTreeMember />} />
        <Route path="/kcc" element={<P.Layout><P.KCCCoin /></P.Layout>} />
        <Route path="/reports" element={<P.Layout><P.Reports /></P.Layout>} />
        <Route path="/policies" element={<P.Layout><P.Policies /></P.Layout>} />
        <Route path="/support" element={<P.Layout><P.Support /></P.Layout>} />
        <Route path="/settings" element={<P.Layout><P.Settings /></P.Layout>} />

        {/* Owner Dashboard Routes */}
        <Route path="/owner/dashboard" element={<P.Layout><P.OwnerDashboard /></P.Layout>} />
        <Route path="/owner/branch-approvals" element={<P.Layout><P.BranchApprovalsAdmin /></P.Layout>} />
        <Route path="/owner/member-requests" element={<P.Layout><P.MemberRequests /></P.Layout>} />
        <Route path="/owner/members" element={<P.Layout><P.GlobalMembers /></P.Layout>} />
        <Route path="/owner/members/edit/:id" element={<P.Layout><P.EditMember /></P.Layout>} />
        <Route path="/owner/branches" element={<P.Layout><P.GlobalBranches /></P.Layout>} />
        <Route path="/owner/branches/create" element={<BranchProvider><P.Layout><P.CreateBranch /></P.Layout></BranchProvider>} />
        <Route path="/owner/branches/edit/:id" element={<BranchProvider><P.Layout><P.EditBranch /></P.Layout></BranchProvider>} />
        <Route path="/owner/branches/edit" element={<Navigate to="/owner/branches" replace />} />
        <Route path="/owner/family-tree" element={<P.Layout><P.FamilyTree /></P.Layout>} />
        <Route path="/owner/add-member" element={<P.Layout><P.AddMember /></P.Layout>} />
        <Route path="/owner/events" element={<P.Layout><P.FamilyEvent /></P.Layout>} />
        <Route path="/owner/events/create" element={<P.Layout><P.CreateEventInvitee /></P.Layout>} />
        <Route path="/owner/events/edit/:id" element={<P.Layout><P.EditEvent /></P.Layout>} />
        <Route path="/owner/privacy" element={<P.Layout><P.PrivacySettings /></P.Layout>} />
        <Route path="/owner/governance" element={<P.Layout><P.GovernancePolicy /></P.Layout>} />
        <Route path="/owner/custom-labels" element={<P.Layout><P.CustomLabels /></P.Layout>} />
        <Route path="/owner/audit-logs" element={<P.Layout><P.AuditLogs /></P.Layout>} />
        <Route path="/governance/view-profile" element={<P.Layout><P.ViewProfile /></P.Layout>} />
        <Route path="/governance/edit-lineage" element={<P.Layout><P.EditLineage /></P.Layout>} />
        <Route path="/governance/add-child" element={<P.Layout><P.AddChild /></P.Layout>} />
        <Route path="/governance/add-parents" element={<P.Layout><P.AddParents /></P.Layout>} />
        <Route path="/governance/add-spouse" element={<P.Layout><P.AddSpouse /></P.Layout>} />

        {/* Family Council Routes */}
        <Route path="/council/dashboard" element={<P.Layout><P.CouncilDashboard /></P.Layout>} />
        <Route path="/council/members" element={<P.Layout><P.CouncilMembers /></P.Layout>} />
        <Route path="/council/members/add" element={<P.Layout><P.AddMember /></P.Layout>} />
        <Route path="/council/approvals" element={<P.Layout><P.CouncilApprovals /></P.Layout>} />
        <Route path="/council/branches" element={<P.Layout><P.CouncilBranches /></P.Layout>} />
        <Route path="/council/branches/create" element={<BranchProvider><P.Layout><P.CouncilCreateBranch /></P.Layout></BranchProvider>} />
        <Route path="/council/branches/edit/:id" element={<BranchProvider><P.Layout><P.EditBranch /></P.Layout></BranchProvider>} />
        <Route path="/council/family-tree" element={<P.Layout><P.FamilyTree /></P.Layout>} />
        <Route path="/council/events/create" element={<EventProvider><P.Layout><P.CreateEvent /></P.Layout></EventProvider>} />
        <Route path="/council/events" element={<P.Layout><P.FamilyEvent /></P.Layout>} />
        <Route path="/events/:id" element={<P.Layout><P.PublicEventDetail /></P.Layout>} />
        <Route path="/council/privacy" element={<P.Layout><P.CouncilPrivacy /></P.Layout>} />
        <Route path="/council/governance" element={<P.Layout><P.CouncilGovernance /></P.Layout>} />

        {/* Branch Manager Routes */}
        <Route path="/branch/dashboard" element={<P.Layout><P.BranchDashboard /></P.Layout>} />
        <Route path="/branch/members" element={<P.Layout><P.BranchMembers /></P.Layout>} />
        <Route path="/branch/members/add" element={<P.Layout><P.BranchAddMember /></P.Layout>} />
        <Route path="/branch/members/edit/:memberId" element={<P.Layout><P.BranchEditMember /></P.Layout>} />
        <Route path="/branch/members/view/:memberId" element={<P.Layout><P.BranchViewMember /></P.Layout>} />

        <Route path="/branch/events" element={<P.Layout><P.BranchEvents /></P.Layout>} />
        <Route path="/branch/create-event" element={<P.Layout><P.BranchCreateEvent /></P.Layout>} />
        <Route path="/branch/approvals" element={<P.Layout><P.BranchApprovals /></P.Layout>} />
        <Route path="/branch/family-tree" element={<P.Layout><P.BranchFamilyTree /></P.Layout>} />


        <Route path="/owner/system" element={<P.Layout><P.System /></P.Layout>} />
        <Route path="/audit-logs" element={<P.Layout><P.AuditLogs /></P.Layout>} />

        {/* Business Dashboard Routes */}
        <Route
          path="/business/dashboard"
          element={
            <ProtectedRoute allowedRole="business">
              <P.BusinessLayout><P.DashboardOverview /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/family-spaces"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <P.BusinessLayout><P.FamilySpaces /></P.BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/business/family-spaces/new" 
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <P.BusinessLayout><P.NewFamilySpace /></P.BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/family-spaces/requests" 
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <P.BusinessLayout><P.FamilySpaceRequests /></P.BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          } 
        />
        <Route
          path="/business/billing"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <P.BusinessLayout><P.Billing /></P.BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/billing/plans/create"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <P.BusinessLayout><P.BillingCreatePlan /></P.BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/billing/refunds"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <P.BusinessLayout><P.RefundFlow /></P.BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/operations"
          element={
            <ProtectedRoute allowedRole="business">
              <P.BusinessLayout><P.Operations /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/governance"
          element={
            <ProtectedRoute allowedRole="business">
              <P.BusinessLayout><P.KCCGovernance /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/ads"
          element={
            <ProtectedRoute allowedRole="business">
              <P.BusinessLayout><P.Ads /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/safety"
          element={
            <ProtectedRoute allowedRole="business">
              <P.BusinessLayout><P.Safety /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/config"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <P.BusinessLayout><P.Config /></P.BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/config/system"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <P.BusinessLayout><P.Config /></P.BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/reliability"
          element={
            <ProtectedRoute allowedRole="business">
              <P.BusinessLayout><P.Reliability /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/audit"
          element={
            <ProtectedRoute allowedRole="business">
              <P.BusinessLayout><P.Audit /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/support"
          element={
            <ProtectedRoute allowedRoles={['business_admin', 'super_admin']}>
              <P.BusinessLayout>
                <P.SupportTickets />
              </P.BusinessLayout>
            </ProtectedRoute>
          }
        />

        {/* DevOps Routes */}
        <Route
          path="/devops/dashboard"
          element={
            <ProtectedRoute allowedRole="devops">
              <P.BusinessLayout><P.DevOpsDashboard /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devops/incidents"
          element={
            <ProtectedRoute allowedRole="devops">
              <P.BusinessLayout><P.IncidentManagement /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devops/monitoring"
          element={
            <ProtectedRoute allowedRole="devops">
              <P.BusinessLayout><P.Monitoring /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devops/logs"
          element={
            <ProtectedRoute allowedRole="devops">
              <P.BusinessLayout><P.LogsExplorer /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devops/config"
          element={
            <ProtectedRoute allowedRole="devops">
              <P.BusinessLayout><P.DevOpsSystemConfig /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devops/jobs"
          element={
            <ProtectedRoute allowedRole="devops">
              <P.BusinessLayout><P.JobControl /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />

        {/* Auditor Routes */}
        <Route
          path="/auditor/dashboard"
          element={
            <ProtectedRoute allowedRole="auditor">
              <P.BusinessLayout><P.AuditorDashboard /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditor/billing"
          element={
            <ProtectedRoute allowedRole="auditor">
              <P.BusinessLayout><P.BillingView /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditor/audit"
          element={
            <ProtectedRoute allowedRole="auditor">
              <P.BusinessLayout><P.AuditorAuditLogs /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditor/abuse"
          element={
            <ProtectedRoute allowedRole="auditor">
              <P.BusinessLayout><P.AbuseWorkflow /></P.BusinessLayout>
            </ProtectedRoute>
          }
        />


        {/* Catch-all for Unauthorized */}
        <Route path="/unauthorized" element={<P.Unauthorized />} />
      </Routes>
        </Suspense>
    </Router>
  </CouncilProvider>
  );
}

export default App;
