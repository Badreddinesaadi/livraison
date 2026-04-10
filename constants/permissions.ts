import { User } from "@/types/auth.types";

export type PermissionAction = "CREATE" | "UPDATE" | "LIST" | "DELETE";
export type PermissionModule = keyof User["permission"];

const VOYAGE_ACTIONS: PermissionAction[] = [
  "CREATE",
  "UPDATE",
  "LIST",
  "DELETE",
];

const RETOUR_ACTIONS: PermissionAction[] = [
  "CREATE",
  "UPDATE",
  "LIST",
  "DELETE",
];

const PROJET_ACTIONS: PermissionAction[] = [
  "CREATE",
  "UPDATE",
  "LIST",
  "DELETE",
];

const ROTATION_ACTIONS: PermissionAction[] = [
  "CREATE",
  "UPDATE",
  "LIST",
  "DELETE",
];

export const hasModulePermission = (
  user: User | null | undefined,
  module: PermissionModule,
  action: PermissionAction,
) => {
  return user?.permission?.[module]?.includes(action) === true;
};

export const hasAnyModulePermission = (
  user: User | null | undefined,
  module: PermissionModule,
  actions: PermissionAction[],
) => {
  return actions.some((action) => hasModulePermission(user, module, action));
};

export const hasVoyagePermission = (
  user: User | null | undefined,
  action: PermissionAction,
) => {
  return hasModulePermission(user, "voyage", action);
};

export const canAccessVoyageModule = (user: User | null | undefined) => {
  return hasAnyModulePermission(user, "voyage", VOYAGE_ACTIONS);
};

export const hasRetourPermission = (
  user: User | null | undefined,
  action: PermissionAction,
) => {
  return hasModulePermission(user, "retour", action);
};

export const canAccessRetourModule = (user: User | null | undefined) => {
  return hasAnyModulePermission(user, "retour", RETOUR_ACTIONS);
};

export const hasProjetPermission = (
  user: User | null | undefined,
  action: PermissionAction,
) => {
  return hasModulePermission(user, "projet", action);
};

export const canAccessProjetModule = (user: User | null | undefined) => {
  return hasAnyModulePermission(user, "projet", PROJET_ACTIONS);
};

export const hasRotationPermission = (
  user: User | null | undefined,
  action: PermissionAction,
) => {
  return hasModulePermission(user, "rotation", action);
};

export const canAccessRotationModule = (user: User | null | undefined) => {
  return hasAnyModulePermission(user, "rotation", ROTATION_ACTIONS);
};
