import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
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

  type Application = {
    jobId : Nat;
    applicant : Principal;
    coverLetter : Text;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    profileType : { #candidate; #employer };
    details : Text;
  };

  // Inject the authorization mixin
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let jobs = Map.empty<Nat, Job>();
  let applications = Map.empty<Nat, Application>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextJobId : Nat = 1;
  var nextApplicationId : Nat = 1;

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Users can only view their own profile, admins can view any profile
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Job management
  public shared ({ caller }) func createJob(
    title : Text,
    description : Text,
    requirements : Text,
    salary : Float,
    location : Text,
  ) : async Nat {
    // Only authenticated users can create jobs
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create jobs");
    };

    let jobId = nextJobId;
    let job : Job = {
      title;
      description;
      requirements;
      salary;
      location;
      createdBy = caller;
    };
    jobs.add(jobId, job);
    nextJobId += 1;
    jobId;
  };

  public query ({ caller }) func getJob(jobId : Nat) : async ?Job {
    // Only authenticated users can view jobs
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view jobs");
    };
    jobs.get(jobId);
  };

  public query ({ caller }) func listJobs() : async [(Nat, Job)] {
    // Only authenticated users can list jobs
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view jobs");
    };
    jobs.entries().toArray();
  };

  public shared ({ caller }) func deleteJob(jobId : Nat) : async () {
    // Only the job creator or admin can delete a job
    switch (jobs.get(jobId)) {
      case (?job) {
        if (caller != job.createdBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only job creator or admin can delete this job");
        };
        Runtime.trap("To be deleted: please refactor from persistent to ephemeral and use remove instead of delete after next migration. ");
      };
      case (null) {
        Runtime.trap("Job not found");
      };
    };
  };

  // Application management
  public shared ({ caller }) func applyForJob(jobId : Nat, coverLetter : Text) : async Nat {
    // Only authenticated users can apply for jobs
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can apply for jobs");
    };

    // Verify job exists
    switch (jobs.get(jobId)) {
      case (null) {
        Runtime.trap("Job not found");
      };
      case (?_) {};
    };

    let applicationId = nextApplicationId;
    let application : Application = {
      jobId;
      applicant = caller;
      coverLetter;
    };
    applications.add(applicationId, application);
    nextApplicationId += 1;
    applicationId;
  };

  public query ({ caller }) func getApplication(applicationId : Nat) : async ?Application {
    // Users can only view their own applications, job creators can view applications for their jobs, admins can view all
    switch (applications.get(applicationId)) {
      case (?application) {
        let isApplicant = caller == application.applicant;
        let isJobCreator = switch (jobs.get(application.jobId)) {
          case (?job) { caller == job.createdBy };
          case (null) { false };
        };
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);

        if (not (isApplicant or isJobCreator or isAdmin)) {
          Runtime.trap("Unauthorized: Can only view your own applications or applications for your jobs");
        };
        ?application;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func listMyApplications() : async [(Nat, Application)] {
    // Only authenticated users can list their applications
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view applications");
    };

    let result = Map.empty<Nat, Application>();
    for ((id, app) in applications.entries()) {
      if (app.applicant == caller) {
        result.add(id, app);
      };
    };
    result.entries().toArray();
  };

  public query ({ caller }) func listApplicationsForJob(jobId : Nat) : async [(Nat, Application)] {
    // Only job creator or admin can view applications for a job
    switch (jobs.get(jobId)) {
      case (?job) {
        if (caller != job.createdBy and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only job creator or admin can view applications");
        };
      };
      case (null) {
        Runtime.trap("Job not found");
      };
    };

    let result = Map.empty<Nat, Application>();
    for ((id, app) in applications.entries()) {
      if (app.jobId == jobId) {
        result.add(id, app);
      };
    };
    result.entries().toArray();
  };
};
