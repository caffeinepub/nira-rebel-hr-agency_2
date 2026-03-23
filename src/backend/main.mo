import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  type Job = {
    title : Text;
    description : Text;
    requirements : Text;
    salary : Float;
    location : Text;
    createdBy : Principal;
  };

  public type ApplicationStatus = {
    #pending;
    #shortlisted;
    #interviewed;
    #rejected;
  };

  type Application = {
    jobId : Nat;
    applicant : Principal;
    coverLetter : Text;
    status : ApplicationStatus;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    profileType : {
      #candidate;
      #employer;
      #staff;
    };
    details : Text;
  };

  type DirectApplication = {
    candidateName : Text;
    jobTitle : Text;
    phone : Text;
    email : Text;
    status : ApplicationStatus;
    appliedAt : Int;
  };

  // Integrate authorization component
  let accessControlState = AccessControl.initState();
  var adminAssigned : Bool = false;
  include MixinAuthorization(accessControlState);

  let jobs = Map.empty<Nat, Job>();
  let applications = Map.empty<Nat, Application>();
  let directApplications = Map.empty<Nat, DirectApplication>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let staffRoles = Map.empty<Principal, Bool>();
  // Pre-approved staff emails: when someone registers with this email they get staff role
  let preApprovedStaffEmails = Map.empty<Text, Bool>();

  var nextJobId : Nat = 1;
  var nextApplicationId : Nat = 1;

  let SEED_ADMIN_EMAIL : Text = "ns244128@gmail.com";
  var adminSeeded : Bool = false;

  func isStaff(caller : Principal) : Bool {
    switch (staffRoles.get(caller)) {
      case (?true) { true };
      case (_) { false };
    };
  };

  func isStaffOrAdmin(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller) or isStaff(caller);
  };

  // Check if current caller is staff or admin (public query)
  public query ({ caller }) func isCallerStaffOrAdmin() : async Bool {
    isStaffOrAdmin(caller);
  };

  // Admin seeding: grants admin to any authenticated caller whose email matches.
  // Anonymous principals are explicitly rejected.
  public shared ({ caller }) func claimAdminSeed(email : Text) : async Bool {
    // Reject anonymous callers -- they must be logged in first
    if (caller.isAnonymous()) { return false };
    if (not Text.equal(email, SEED_ADMIN_EMAIL)) { return false };
    // Already admin -- return true
    if (AccessControl.isAdmin(accessControlState, caller)) { return true };
    accessControlState.userRoles.add(caller, #admin);
    adminAssigned := true;
    adminSeeded := true;
    true;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    // Auto-assign staff role if email is pre-approved
    if (profile.email != "" and preApprovedStaffEmails.get(profile.email) == ?true) {
      staffRoles.add(caller, true);
    };
  };

  public shared ({ caller }) func createJob(
    title : Text,
    description : Text,
    requirements : Text,
    salary : Float,
    location : Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create jobs");
    };
    let jobId = nextJobId;
    let job : Job = { title; description; requirements; salary; location; createdBy = caller };
    jobs.add(jobId, job);
    nextJobId += 1;
    jobId;
  };

  public query ({ caller }) func getJob(jobId : Nat) : async ?Job {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view jobs");
    };
    jobs.get(jobId);
  };

  public query ({ caller }) func listJobs() : async [(Nat, Job)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view jobs");
    };
    jobs.entries().toArray();
  };

  public shared ({ caller }) func deleteJob(jobId : Nat) : async () {
    switch (jobs.get(jobId)) {
      case (?job) {
        if (caller != job.createdBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only job creator or admin can delete this job");
        };
        jobs.remove(jobId);
      };
      case (null) { Runtime.trap("Job not found") };
    };
  };

  public shared ({ caller }) func applyForJob(jobId : Nat, coverLetter : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can apply for jobs");
    };
    switch (jobs.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?_) {};
    };
    let applicationId = nextApplicationId;
    let application : Application = { jobId; applicant = caller; coverLetter; status = #pending };
    applications.add(applicationId, application);
    nextApplicationId += 1;
    applicationId;
  };

  public shared ({ caller }) func updateApplicationStatus(applicationId : Nat, status : ApplicationStatus) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only staff or admin can update application status");
    };
    switch (applications.get(applicationId)) {
      case (?application) {
        let updatedApplication : Application = { application with status };
        applications.add(applicationId, updatedApplication);
      };
      case (null) { Runtime.trap("Application not found") };
    };
  };

  public query ({ caller }) func getApplication(applicationId : Nat) : async ?Application {
    switch (applications.get(applicationId)) {
      case (?application) {
        let isApplicant = caller == application.applicant;
        let isJobCreator = switch (jobs.get(application.jobId)) {
          case (?job) { caller == job.createdBy };
          case (null) { false };
        };
        if (not (isApplicant or isJobCreator or isStaffOrAdmin(caller))) {
          Runtime.trap("Unauthorized: Can only view your own applications");
        };
        ?application;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func listMyApplications() : async [(Nat, Application)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view applications");
    };
    applications.filter(func(_id, app) { app.applicant == caller }).entries().toArray();
  };

  public query ({ caller }) func listApplicationsForJob(jobId : Nat) : async [(Nat, Application)] {
    switch (jobs.get(jobId)) {
      case (?job) {
        if (caller != job.createdBy and not isStaffOrAdmin(caller)) {
          Runtime.trap("Unauthorized: Only job creator, staff, or admin can view applications");
        };
      };
      case (null) { Runtime.trap("Job not found") };
    };
    applications.filter(func(_id, app) { app.jobId == jobId }).entries().toArray();
  };

  public query ({ caller }) func listAllApplications() : async [(Nat, Application)] {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only staff or admin can view all applications");
    };
    applications.entries().toArray();
  };

  public query ({ caller }) func listAllUsers() : async [(Principal, UserProfile)] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view all users");
    };
    userProfiles.entries().toArray();
  };

  public shared ({ caller }) func assignStaffRole(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can assign staff role");
    };
    staffRoles.add(user, true);
  };

  public shared ({ caller }) func removeStaffRole(user : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can remove staff role");
    };
    staffRoles.remove(user);
  };

  public query ({ caller }) func isUserStaff(user : Principal) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can check staff status");
    };
    isStaff(user);
  };

  // Pre-approved staff emails management (admin only)
  public shared ({ caller }) func addPreApprovedStaffEmail(email : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can manage pre-approved staff emails");
    };
    preApprovedStaffEmails.add(email, true);
  };

  public shared ({ caller }) func removePreApprovedStaffEmail(email : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can manage pre-approved staff emails");
    };
    preApprovedStaffEmails.remove(email);
  };

  public query ({ caller }) func listPreApprovedStaffEmails() : async [Text] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view pre-approved staff emails");
    };
    preApprovedStaffEmails.keys().toArray();
  };

  // DirectApplication (open to all, no auth required)
  public shared func submitDirectApplication(
    candidateName : Text,
    jobTitle : Text,
    phone : Text,
    email : Text,
  ) : async Nat {
    let applicationId = nextApplicationId;
    let application : DirectApplication = {
      candidateName;
      jobTitle;
      phone;
      email;
      status = #pending;
      appliedAt = Time.now();
    };
    directApplications.add(applicationId, application);
    nextApplicationId += 1;
    applicationId;
  };

  // List all direct (admin or staff only)
  public query ({ caller }) func listAllDirectApplications() : async [(Nat, DirectApplication)] {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only staff or admin can view direct applications");
    };
    directApplications.entries().toArray();
  };

  // Update direct (admin or staff only)
  public shared ({ caller }) func updateDirectApplicationStatus(id : Nat, status : ApplicationStatus) : async () {
    if (not isStaffOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only staff or admin can update direct application status");
    };
    switch (directApplications.get(id)) {
      case (?application) {
        let updatedApplication : DirectApplication = { application with status };
        directApplications.add(id, updatedApplication);
      };
      case (null) { Runtime.trap("Direct application not found") };
    };
  };
};
