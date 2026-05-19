const normalize = (value: string): string => value.trim().toLowerCase();

export const getDashboardModuleKey = (moduleName: string): string =>
  normalize(moduleName).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'other';

export const getDashboardModuleToneClass = (moduleName: string): string =>
  `dashboard-module-tone--${getDashboardModuleKey(moduleName)}`;
