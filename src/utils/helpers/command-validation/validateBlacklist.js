const factoryRoleValidation = require("./_factoryRoleValidation");
const AppError = require("../../AppError");

const validateBlacklist = (blacklistedRoles, memberRoles) => {
  //check if member has any of the blacklisted roles
  const containsBlacklistedRole = blacklistedRoles.reduce(
    (flag, blacklisted) =>
      memberRoles.some((role) => role.id === blacklisted.id) ? true : flag,
    false
  );

  if (!containsBlacklistedRole) return true;

  // prettier-ignore
  throw new AppError('Blacklisted',`You cannot use this command due to having one of the following roles: \`${blacklistedRoles.join(", ")}\``);
};

const roleNotFound = (roleName) => {
  new AppError(
    "Missing role on guild",
    `Blacklisted role \`${roleName}\` is not found`
  );
};

module.exports = factoryRoleValidation(validateBlacklist, roleNotFound);
