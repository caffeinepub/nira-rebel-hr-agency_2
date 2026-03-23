import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Job {
    title: string;
    salary: number;
    createdBy: Principal;
    description: string;
    requirements: string;
    location: string;
}
export interface Application {
    applicant: Principal;
    jobId: bigint;
    coverLetter: string;
}
export interface UserProfile {
    name: string;
    email: string;
    details: string;
    profileType: Variant_employer_candidate;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_employer_candidate {
    employer = "employer",
    candidate = "candidate"
}
export interface backendInterface {
    applyForJob(jobId: bigint, coverLetter: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createJob(title: string, description: string, requirements: string, salary: number, location: string): Promise<bigint>;
    deleteJob(jobId: bigint): Promise<void>;
    getApplication(applicationId: bigint): Promise<Application | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJob(jobId: bigint): Promise<Job | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listApplicationsForJob(jobId: bigint): Promise<Array<[bigint, Application]>>;
    listJobs(): Promise<Array<[bigint, Job]>>;
    listMyApplications(): Promise<Array<[bigint, Application]>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
