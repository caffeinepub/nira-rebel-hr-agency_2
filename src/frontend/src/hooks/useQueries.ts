import type { ApplicationStatus, DirectApplication } from "@/backend";
import { useActor } from "@/hooks/useActor";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllApplications() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListJobs() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listJobs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignStaffRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.assignStaffRole(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useRemoveStaffRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeStaffRole(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useUpdateApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: ApplicationStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateApplicationStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allApplications"] });
    },
  });
}

export function useIsUserStaff(user: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isStaff", user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return false;
      return actor.isUserStaff(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useListAllDirectApplications() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[bigint, DirectApplication]>>({
    queryKey: ["allDirectApplications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllDirectApplications();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitDirectApplication() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      candidateName,
      jobTitle,
      phone,
      email,
    }: {
      candidateName: string;
      jobTitle: string;
      phone: string;
      email: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitDirectApplication(
        candidateName,
        jobTitle,
        phone,
        email,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDirectApplications"] });
    },
  });
}

export function useUpdateDirectApplicationStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: { id: bigint; status: ApplicationStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateDirectApplicationStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allDirectApplications"] });
    },
  });
}

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}
