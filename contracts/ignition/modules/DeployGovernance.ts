import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const GovernanceModule = buildModule("GovernanceModule", (m) => {
  // No constructor arguments needed for Governance contract
  const governance = m.contract("Governance", []);

  return { governance };
});

export default GovernanceModule; 