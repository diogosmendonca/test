import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { ethers } from 'ethers'
import './App.css'
import GovernanceABI from '../abi/Governance.json'

// Read contract address from .env file (Vite specific)
const contractAddress = import.meta.env.VITE_GOVERNANCE_CONTRACT_ADDRESS

// Check if address is loaded correctly
if (!contractAddress) {
  console.error("VITE_GOVERNANCE_CONTRACT_ADDRESS not found in .env file!")
  // You might want to display an error message to the user here
}

function App() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [proposals, setProposals] = useState([])
  const [submitLoading, setSubmitLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [account, setAccount] = useState(null) // To store connected account
  const [provider, setProvider] = useState(null) // Add provider state
  const [contract, setContract] = useState(null) // To store contract instance

  // Function to connect wallet
  const connectWallet = async () => {
    setError(null)
    console.log("Attempting to connect wallet...")
    try {
      if (window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const connectedAccount = accounts[0]
        setAccount(connectedAccount)
        console.log("Wallet connected:", connectedAccount)

        // Initialize ethers provider
        const web3Provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(web3Provider)

        // Listen for account changes
        window.ethereum.on('accountsChanged', (newAccounts) => {
          if (newAccounts.length > 0) {
            setAccount(newAccounts[0])
            console.log("Account changed to:", newAccounts[0])
            // Re-initialize provider and contract if necessary, or just update UI
            const reconnectedProvider = new ethers.BrowserProvider(window.ethereum)
            setProvider(reconnectedProvider)
          } else {
            // Handle disconnection
            setAccount(null)
            setProvider(null)
            setContract(null)
            setProposals([]) // Clear proposals on disconnect
            console.log("Wallet disconnected")
            setError("Wallet disconnected. Please connect again.")
          }
        })

        // Listen for network changes (optional but recommended)
        window.ethereum.on('chainChanged', (_chainId) => {
          // Reload the page or re-initialize the app to ensure correct network context
          console.log("Network changed to:", _chainId)
          window.location.reload()
        })

      } else {
        setError("MetaMask not detected. Please install MetaMask!")
        console.error("MetaMask not detected.")
      }
    } catch (err) {
      console.error("Error connecting wallet:", err)
      if (err.code === 4001) { // User rejected connection
        setError("Wallet connection rejected by user.")
      } else {
        setError("Failed to connect wallet. See console for details.")
      }
    }
  }

  // Function to initialize contract interaction
  const initContract = async () => {
    if (!provider || !account || !contractAddress) {
      console.log("Provider, account, or contract address missing for initContract.")
      return
    }
    console.log("Initializing contract with address:", contractAddress)
    setError(null)
    try {
      // Get signer needed to write transactions
      const signer = await provider.getSigner()
      // Create contract instance
      const governanceContract = new ethers.Contract(contractAddress, GovernanceABI.abi, signer)
      setContract(governanceContract)
      console.log("Contract initialized successfully.")
    } catch (err) {
      console.error("Error initializing contract:", err)
      setError("Failed to initialize contract interaction. Is the address correct and are you on the Sepolia network?")
      setContract(null) // Ensure contract state is null on error
    }
  }

  // Function to fetch proposals
  const fetchProposals = async () => {
    if (!contract) {
      console.log("Contract not initialized, cannot fetch proposals.")
      // Optionally set an error message
      // setError("Cannot fetch proposals, contract not ready.")
      return
    }
    console.log("Fetching proposals...")
    setFetchLoading(true)
    setError(null)
    try {
      const fetchedProposals = await contract.getAllProposals()
      // The contract returns an array of structs (tuples). We can map them if needed, 
      // but since they only contain strings, direct use might be fine.
      // Example mapping if structure was complex or needed transformation:
      const formattedProposals = fetchedProposals.map(p => ({
        title: p.title,        // Access tuple elements by name (if ABI provides names)
        description: p.description 
        // Or by index: title: p[0], description: p[1]
      }))
      setProposals(formattedProposals)
      console.log("Proposals fetched:", formattedProposals)
    } catch (err) {
      console.error("Error fetching proposals:", err)
      setError("Failed to fetch proposals. Check console for details.")
      setProposals([]) // Clear proposals on error
    } finally {
      setFetchLoading(false)
    }
  }

  // Function to handle proposal submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !description) {
      setError("Title and description cannot be empty.")
      return
    }
    if (!contract) {
      setError("Contract not initialized.")
      return
    }
    setSubmitLoading(true)
    setError(null)
    console.log("Submitting proposal:", { title, description })
    
    try {
      // Send the transaction to create a proposal
      const tx = await contract.createProposal(title, description)
      console.log("Transaction sent:", tx.hash)
      
      // Wait for the transaction to be mined
      await tx.wait() 
      console.log("Transaction confirmed:", tx.hash)
      
      // Clear form and refresh proposals list
      setTitle('')
      setDescription('')
      fetchProposals() // Refresh list after successful submission
      
    } catch (err) {
      console.error("Error submitting proposal:", err)
      // More specific error handling can be added here (e.g., check err.code)
       if (err.reason) { // Check for revert reason from contract
         setError(`Proposal submission failed: ${err.reason}`)
       } else if (err.code === 'ACTION_REJECTED') { // Check if user rejected in MetaMask
           setError("Transaction rejected by user.")
       } else {
           setError("Failed to submit proposal. Check console for details.")
       }
    } finally {
      setSubmitLoading(false)
    }
  }

  // Effect to try connecting wallet automatically on load (optional)
  // Or just let the user click the button
  // useEffect(() => {
  //   connectWallet(); 
  // }, []);

  // Effect to initialize contract when provider and account are ready
  useEffect(() => {
    if (provider && account && contractAddress) { // Also check if address is loaded
      initContract()
    }
    // Clear contract if provider/account disconnects or address missing
    if (!provider || !account || !contractAddress) {
      setContract(null)
    }
  }, [provider, account])

  // Effect to fetch proposals when contract is initialized
  useEffect(() => {
    if (contract) {
      fetchProposals()
    }
  }, [contract])

  return (
    <div className="App">
      <h1>Governance Proposals</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected Account: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p> // Shorten display
      )}
      {error && <p className="error">Error: {error}</p>} // Display connection errors

      <section className="create-proposal">
        <h2>Create New Proposal</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="title">Title:</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitLoading || !contract} // Use submitLoading here
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitLoading || !contract} // Use submitLoading here
            />
          </div>
          <button type="submit" disabled={submitLoading || !contract}>
            {submitLoading ? 'Submitting...' : 'Submit Proposal'}
          </button>
          {error && <p className="error">Error: {error}</p>}
        </form>
      </section>

      <section className="proposal-list">
        <h2>Existing Proposals</h2>
        <button onClick={fetchProposals} disabled={fetchLoading || !contract}>
          {fetchLoading ? 'Refreshing...' : 'Refresh Proposals'}
        </button>
        {fetchLoading && <p>Loading proposals...</p>}
        {!fetchLoading && proposals.length === 0 ? (
          <p>No proposals submitted yet or failed to load.</p>
        ) : (
          <ul>
            {proposals.map((proposal, index) => (
              <li key={index}>
                <h3>{proposal.title}</h3>
                <p>{proposal.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
