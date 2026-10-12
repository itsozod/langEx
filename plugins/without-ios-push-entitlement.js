const { withEntitlementsPlist } = require('expo/config-plugins');

/**
 * expo-notifications enables APNs on iOS by default, but LangEx currently registers for remote
 * notifications on Android only. A free Apple Personal Team cannot provision the APNs capability,
 * so remove the unused entitlement after the notifications plugin has added it.
 */
const withoutIosPushEntitlement = (config) =>
  withEntitlementsPlist(config, (modConfig) => {
    delete modConfig.modResults['aps-environment'];
    return modConfig;
  });

module.exports = withoutIosPushEntitlement;
