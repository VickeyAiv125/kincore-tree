import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import AuthCallback from './pages/AuthCallback';
import AcceptInvite from './pages/AcceptInvite';

import AdminDashboard from './pages/admin/AdminDashboard';
import GovernanceRoles from './pages/admin/GovernanceRoles';
import AddRole from './pages/admin/AddRole';
import ContentModeration from './pages/admin/ContentModeration';
import LineageRegistry from './pages/admin/LineageRegistry';
import RestrictAuthor from './pages/admin/RestrictAuthor';
import MemberRegistry from './pages/admin/MemberRegistry';
import EventsEngagement from './pages/admin/EventsEngagement';
import EventDetails from './pages/admin/EventDetails';
import CreateEvent from './pages/admin/CreateEvent';
import { EventProvider } from './context/EventContext';
import Mall from './pages/admin/Mall';
import MediaRepository from './pages/admin/MediaRepository';
import Subscription from './pages/admin/Subscription';
import PlanFeatures from './pages/admin/PlanFeatures';
import MigrationMap from './pages/admin/MigrationMap';
import CreateMigrationPoint from './pages/admin/CreateMigrationPoint';
import MigrationMapWebview from './pages/admin/MigrationMapWebview';
import KCCCoin from './pages/admin/KCCCoin';
import Reports from './pages/admin/Reports';
import Policies from './pages/admin/Policies';
import Support from './pages/admin/Support';
import Settings from './pages/admin/Settings';
import BranchApprovalsAdmin from './pages/owner/BranchApprovals';
import MemberRequests from './pages/owner/MemberRequests';
import SecretSantaPreview from './pages/admin/SecretSantaPreview';
import SecretSantaLocked from './pages/admin/SecretSantaLocked';


import OwnerDashboard from './pages/owner/OwnerDashboard';
import GlobalMembers from './pages/owner/GlobalMembers';
import CreateBranch from './pages/owner/CreateBranch';
import { BranchProvider } from './context/BranchContext';
import { CouncilProvider } from './context/CouncilContext';
import GlobalBranches from './pages/owner/GlobalBranches';
import FamilyTree from './pages/owner/FamilyTree';
import AddMember from './pages/owner/AddMember';
import FamilyEvent from './pages/owner/FamilyEvent';
import CreateEventInvitee from './pages/owner/CreateEventInvitee';
import PrivacySettings from './pages/owner/PrivacySettings';
import GovernancePolicy from './pages/owner/GovernancePolicy';
import CustomLabels from './pages/owner/CustomLabels';
import AuditLogs from './pages/owner/AuditLogs';
import CouncilDashboard from './pages/council/CouncilDashboard';
import CouncilMembers from './pages/council/CouncilMembers';
import CouncilApprovals from './pages/council/CouncilApprovals';
import CouncilCreateBranch from './pages/council/CouncilCreateBranch';
import CouncilBranches from './pages/council/CouncilBranches';
import CouncilPrivacy from './pages/council/CouncilPrivacy';
import CouncilGovernance from './pages/council/CouncilGovernance';
import EditMember from './pages/owner/EditMember';
import EditBranch from './pages/owner/EditBranch';
import ViewProfile from './pages/owner/ViewProfile';
import EditLineage from './pages/owner/EditLineage';
import AddChild from './pages/owner/AddChild';
import AddParents from './pages/owner/AddParents';
import AddSpouse from './pages/owner/AddSpouse';
import AddTreeMember from './pages/owner/AddTreeMember';
import System from './pages/owner/System';
import BranchDashboard from './pages/branch/BranchDashboard';
import BranchMembers from './pages/branch/BranchMembers';
import BranchAddMember from './pages/branch/BranchAddMember';
import BranchEditMember from './pages/branch/BranchEditMember';
import BranchViewMember from './pages/branch/BranchViewMember';
import BranchEvents from './pages/branch/BranchEvents';
import BranchCreateEvent from './pages/branch/CreateEvent';
import BranchApprovals from './pages/branch/BranchApprovals';
import BranchFamilyTree from './pages/branch/BranchFamilyTree';
import EditEvent from './pages/owner/EditEvent';
import Layout from './components/layout/Layout';
import BusinessLayout from './components/layout/BusinessLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { BusinessProvider } from './context/BusinessContext';
import Unauthorized from './pages/Unauthorized';
import DashboardOverview from './pages/business/DashboardOverview';
import FamilySpaces from './pages/business/FamilySpaces';
import NewFamilySpace from './pages/business/NewFamilySpace';
import FamilySpaceRequests from './pages/admin/FamilySpaceRequests';
import Billing from './pages/business/Billing';
import BillingCreatePlan from './pages/business/BillingCreatePlan';
import RefundFlow from './pages/business/RefundFlow';
import Operations from './pages/business/Operations';
import KCCGovernance from './pages/business/KCCGovernance';
import Ads from './pages/business/Ads';
import Safety from './pages/business/Safety';
import SupportTickets from './pages/business/SupportTickets';
import Config from './pages/business/Config';
import Reliability from './pages/business/Reliability';
import Audit from './pages/business/Audit';

// DevOps Pages
import DevOpsDashboard from './pages/devops/DevOpsDashboard';
import DevOpsSystemConfig from './pages/devops/SystemConfig';
import JobControl from './pages/devops/JobControl';
import IncidentManagement from './pages/devops/IncidentManagement';
import Monitoring from './pages/devops/Monitoring';
import LogsExplorer from './pages/devops/LogsExplorer';

// Auditor Pages
import AuditorDashboard from './pages/auditor/AuditorDashboard';
import BillingView from './pages/auditor/BillingView';
import AuditorAuditLogs from './pages/auditor/AuditLogs';
import AbuseWorkflow from './pages/auditor/AbuseWorkflow';
import PublicEventDetail from './pages/PublicEventDetail';




function OAuthSync() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/accept-invite') || location.pathname.includes('/reset-password') || location.pathname.includes('/auth/callback')) {
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
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />

        {/* Family Hub Routes */}
        <Route path="/dashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/governance" element={<Layout><GovernanceRoles /></Layout>} />
        <Route path="/governance/add-role" element={<Layout><AddRole /></Layout>} />
        <Route path="/content-moderation" element={<Layout><ContentModeration /></Layout>} />
        <Route path="/lineage-registry" element={<Layout><LineageRegistry /></Layout>} />

        <Route path="/restrict-author" element={<Layout><RestrictAuthor /></Layout>} />
        <Route path="/member-registry" element={<Layout><MemberRegistry /></Layout>} />
        <Route path="/events" element={<Layout><EventsEngagement /></Layout>} />
        <Route path="/admin/events/:id" element={<Layout><EventDetails /></Layout>} />
        <Route path="/events/create" element={<EventProvider><Layout><CreateEvent /></Layout></EventProvider>} />
        <Route path="/events/secret-santa/preview" element={<EventProvider><Layout><SecretSantaPreview /></Layout></EventProvider>} />
        <Route path="/events/secret-santa/locked" element={<EventProvider><Layout><SecretSantaLocked /></Layout></EventProvider>} />
        <Route path="/mall" element={<Layout><Mall /></Layout>} />
        <Route path="/media" element={<Layout><MediaRepository /></Layout>} />
        <Route path="/subscription" element={<Layout><Subscription /></Layout>} />
        <Route path="/subscription/features" element={<Layout><PlanFeatures /></Layout>} />
        <Route path="/migration" element={<Layout><MigrationMap /></Layout>} />
        <Route path="/migration/add" element={<Layout><CreateMigrationPoint /></Layout>} />
        <Route path="/migration-map/webview/:familySpaceId" element={<MigrationMapWebview />} />
        <Route path="/family-tree/webview" element={<FamilyTree />} />
        <Route path="/family-tree/webview/:familySpaceId" element={<FamilyTree />} />
        <Route path="/family-tree/webview/:familySpaceId/add-child" element={<AddChild />} />
        <Route path="/family-tree/webview/:familySpaceId/add-parent" element={<AddParents />} />
        <Route path="/family-tree/webview/:familySpaceId/add-member" element={<AddTreeMember />} />
        <Route path="/kcc" element={<Layout><KCCCoin /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/policies" element={<Layout><Policies /></Layout>} />
        <Route path="/support" element={<Layout><Support /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />

        {/* Owner Dashboard Routes */}
        <Route path="/owner/dashboard" element={<Layout><OwnerDashboard /></Layout>} />
        <Route path="/owner/branch-approvals" element={<Layout><BranchApprovalsAdmin /></Layout>} />
        <Route path="/owner/member-requests" element={<Layout><MemberRequests /></Layout>} />
        <Route path="/owner/members" element={<Layout><GlobalMembers /></Layout>} />
        <Route path="/owner/members/edit/:id" element={<Layout><EditMember /></Layout>} />
        <Route path="/owner/branches" element={<Layout><GlobalBranches /></Layout>} />
        <Route path="/owner/branches/create" element={<BranchProvider><Layout><CreateBranch /></Layout></BranchProvider>} />
        <Route path="/owner/branches/edit/:id" element={<BranchProvider><Layout><EditBranch /></Layout></BranchProvider>} />
        <Route path="/owner/branches/edit" element={<Navigate to="/owner/branches" replace />} />
        <Route path="/owner/family-tree" element={<Layout><FamilyTree /></Layout>} />
        <Route path="/owner/add-member" element={<Layout><AddMember /></Layout>} />
        <Route path="/owner/events" element={<Layout><FamilyEvent /></Layout>} />
        <Route path="/owner/events/create" element={<Layout><CreateEventInvitee /></Layout>} />
        <Route path="/owner/events/edit/:id" element={<Layout><EditEvent /></Layout>} />
        <Route path="/owner/privacy" element={<Layout><PrivacySettings /></Layout>} />
        <Route path="/owner/governance" element={<Layout><GovernancePolicy /></Layout>} />
        <Route path="/owner/custom-labels" element={<Layout><CustomLabels /></Layout>} />
        <Route path="/owner/audit-logs" element={<Layout><AuditLogs /></Layout>} />
        <Route path="/governance/view-profile" element={<Layout><ViewProfile /></Layout>} />
        <Route path="/governance/edit-lineage" element={<Layout><EditLineage /></Layout>} />
        <Route path="/governance/add-child" element={<Layout><AddChild /></Layout>} />
        <Route path="/governance/add-parents" element={<Layout><AddParents /></Layout>} />
        <Route path="/governance/add-spouse" element={<Layout><AddSpouse /></Layout>} />

        {/* Family Council Routes */}
        <Route path="/council/dashboard" element={<Layout><CouncilDashboard /></Layout>} />
        <Route path="/council/members" element={<Layout><CouncilMembers /></Layout>} />
        <Route path="/council/members/add" element={<Layout><AddMember /></Layout>} />
        <Route path="/council/approvals" element={<Layout><CouncilApprovals /></Layout>} />
        <Route path="/council/branches" element={<Layout><CouncilBranches /></Layout>} />
        <Route path="/council/branches/create" element={<BranchProvider><Layout><CouncilCreateBranch /></Layout></BranchProvider>} />
        <Route path="/council/branches/edit/:id" element={<BranchProvider><Layout><EditBranch /></Layout></BranchProvider>} />
        <Route path="/council/family-tree" element={<Layout><FamilyTree /></Layout>} />
        <Route path="/council/events/create" element={<EventProvider><Layout><CreateEvent /></Layout></EventProvider>} />
        <Route path="/council/events" element={<Layout><FamilyEvent /></Layout>} />
        <Route path="/events/:id" element={<Layout><PublicEventDetail /></Layout>} />
        <Route path="/council/privacy" element={<Layout><CouncilPrivacy /></Layout>} />
        <Route path="/council/governance" element={<Layout><CouncilGovernance /></Layout>} />

        {/* Branch Manager Routes */}
        <Route path="/branch/dashboard" element={<Layout><BranchDashboard /></Layout>} />
        <Route path="/branch/members" element={<Layout><BranchMembers /></Layout>} />
        <Route path="/branch/members/add" element={<Layout><BranchAddMember /></Layout>} />
        <Route path="/branch/members/edit/:memberId" element={<Layout><BranchEditMember /></Layout>} />
        <Route path="/branch/members/view/:memberId" element={<Layout><BranchViewMember /></Layout>} />

        <Route path="/branch/events" element={<Layout><BranchEvents /></Layout>} />
        <Route path="/branch/create-event" element={<Layout><BranchCreateEvent /></Layout>} />
        <Route path="/branch/approvals" element={<Layout><BranchApprovals /></Layout>} />
        <Route path="/branch/family-tree" element={<Layout><BranchFamilyTree /></Layout>} />


        <Route path="/owner/system" element={<Layout><System /></Layout>} />
        <Route path="/audit-logs" element={<Layout><AuditLogs /></Layout>} />

        {/* Business Dashboard Routes */}
        <Route
          path="/business/dashboard"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessLayout><DashboardOverview /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/family-spaces"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <BusinessLayout><FamilySpaces /></BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/business/family-spaces/new" 
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <BusinessLayout><NewFamilySpace /></BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/business/family-spaces/requests" 
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <BusinessLayout><FamilySpaceRequests /></BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          } 
        />
        <Route
          path="/business/billing"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <BusinessLayout><Billing /></BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/billing/plans/create"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <BusinessLayout><BillingCreatePlan /></BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/billing/refunds"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <BusinessLayout><RefundFlow /></BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/operations"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessLayout><Operations /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/governance"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessLayout><KCCGovernance /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/ads"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessLayout><Ads /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/safety"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessLayout><Safety /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/config"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <BusinessLayout><Config /></BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/config/system"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessProvider>
                <BusinessLayout><Config /></BusinessLayout>
              </BusinessProvider>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/reliability"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessLayout><Reliability /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/audit"
          element={
            <ProtectedRoute allowedRole="business">
              <BusinessLayout><Audit /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/business/support"
          element={
            <ProtectedRoute allowedRoles={['business_admin', 'super_admin']}>
              <BusinessLayout>
                <SupportTickets />
              </BusinessLayout>
            </ProtectedRoute>
          }
        />

        {/* DevOps Routes */}
        <Route
          path="/devops/dashboard"
          element={
            <ProtectedRoute allowedRole="devops">
              <BusinessLayout><DevOpsDashboard /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devops/incidents"
          element={
            <ProtectedRoute allowedRole="devops">
              <BusinessLayout><IncidentManagement /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devops/monitoring"
          element={
            <ProtectedRoute allowedRole="devops">
              <BusinessLayout><Monitoring /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devops/logs"
          element={
            <ProtectedRoute allowedRole="devops">
              <BusinessLayout><LogsExplorer /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devops/config"
          element={
            <ProtectedRoute allowedRole="devops">
              <BusinessLayout><DevOpsSystemConfig /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/devops/jobs"
          element={
            <ProtectedRoute allowedRole="devops">
              <BusinessLayout><JobControl /></BusinessLayout>
            </ProtectedRoute>
          }
        />

        {/* Auditor Routes */}
        <Route
          path="/auditor/dashboard"
          element={
            <ProtectedRoute allowedRole="auditor">
              <BusinessLayout><AuditorDashboard /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditor/billing"
          element={
            <ProtectedRoute allowedRole="auditor">
              <BusinessLayout><BillingView /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditor/audit"
          element={
            <ProtectedRoute allowedRole="auditor">
              <BusinessLayout><AuditorAuditLogs /></BusinessLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/auditor/abuse"
          element={
            <ProtectedRoute allowedRole="auditor">
              <BusinessLayout><AbuseWorkflow /></BusinessLayout>
            </ProtectedRoute>
          }
        />


        {/* Catch-all for Unauthorized */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  </CouncilProvider>
  );
}

export default App;
