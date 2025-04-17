# Governance DApp (Solidity + React)

This project demonstrates a simple decentralized application (DApp) for creating and viewing governance proposals. It consists of a Solidity smart contract and a React frontend.


## Developer Setup

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm
*   MetaMask browser extension (or another wallet)
*   SepoliaETH (for deploying to the Sepolia testnet)

### 1. Backend (Smart Contract)

**a. Install Dependencies:**

Navigate to the project root directory of the contracts `contracts/` and install the necessary Node.js packages.

```bash
npm install
```

**b. Configure Environment:**

Create a `.env` file in the project root directory (alongside `hardhat.config.ts`). Add your Sepolia RPC URL and the private key of the account you want to deploy from:

```dotenv
# .env (root directory)
SEPOLIA_RPC_URL="YOUR_SEPOLIA_RPC_URL"
DEPLOYER_PRIVATE_KEY="YOUR_DEPLOYER_PRIVATE_KEY"
```
*Replace placeholders with your actual values.*
* **Important:** Ensure the deployer account has enough SepoliaETH for gas fees.*

**c. Compile Contract:**

Compile the Solidity smart contract:

```bash
npx hardhat compile
```
This generates the ABI file in the `artifacts/` directory.

**d. Run Tests (Optional):**

```bash
npx hardhat test
```

**e. Deploy to Sepolia:**

Deploy the contract to the Sepolia test network using Hardhat Ignition:

```bash
npx hardhat ignition deploy ignition/modules/DeployGovernance.ts --network sepolia
```
Take note of the deployed contract address printed in the terminal output.

### 2. Frontend (React App)

**a. Install Dependencies:**

Navigate to the `frontend` directory and install its dependencies:

```bash
cd frontend
npm install
```

**b. Configure Environment:**

Create a `.env` file inside the `frontend` directory:

```dotenv
# frontend/.env
VITE_GOVERNANCE_CONTRACT_ADDRESS="YOUR_DEPLOYED_CONTRACT_ADDRESS"
```
Replace `YOUR_DEPLOYED_CONTRACT_ADDRESS` with the address obtained after deploying the smart contract in step 1.e.

**c. Update ABI (If Contract Changes):**

If you modify the `Governance.sol` contract and recompile, you need to update the ABI file used by the frontend:

1.  After running `npx hardhat compile` in the root directory...
2.  Copy the updated ABI from the root `artifacts/` directory to the frontend:

    ```bash
    # Run from the project root directory
    cp artifacts/contracts/Governance.sol/Governance.json frontend/src/contracts/
    ```

**d. Run Frontend Development Server:**

While still inside the `frontend` directory, start the Vite development server:

```bash
npm run dev
```
Open the local URL provided in your browser (usually `http://localhost:5173`).

## Using the Application

1.  Ensure MetaMask is installed and connected to the Sepolia network.
2.  Open the frontend application in your browser.
3.  Click "Connect Wallet" to connect your MetaMask account.
4.  The application will fetch and display existing proposals.
5.  Use the form to enter a title and description for a new proposal.
6.  Click "Submit Proposal" and approve the transaction in MetaMask.
7.  The proposal list should update automatically after the transaction is confirmed. 