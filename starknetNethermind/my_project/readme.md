# Starknet Development Guide
A comprehensive guide to set up your Starknet development environment, create a wallet, and deploy your first smart contract.

## Part 1: Development Environment Setup

### Prerequisites
- macOS (This guide is tested on macOS)
- Terminal access
- Git installed
- Chrome or Brave browser for wallet

### Installation Steps

#### 1. Install ASDF Version Manager
```bash
# Clone ASDF
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.14.1

# Add ASDF to shell configuration
echo '. "$HOME/.asdf/asdf.sh"' >> ~/.zshrc
source ~/.zshrc
```

#### 2. Install Scarb
```bash
# Add Scarb plugin to ASDF
asdf plugin add scarb

# Install latest version
asdf install scarb latest

# Set it as global version
asdf global scarb 2.9.1
```

#### 3. Install Starknet Foundry
```bash
# Add Starknet Foundry plugin to ASDF
asdf plugin add starknet-foundry

# Install latest version
asdf install starknet-foundry latest

# Set it as global version
asdf global starknet-foundry 0.34.0
```

#### 4. Install Starkli
```bash
# Step 1: Download starkliup
curl https://get.starkli.sh | sh

# Step 2: Close and reopen your terminal, then run:
starkliup

# Step 3: Close and reopen your terminal again, then verify:
starkli --version  # Should show version 0.3.5
```

⚠️ Important: You must restart your terminal after each step. Simply running `source ~/.zshrc` is not sufficient.

### Verify Installation
```bash
scarb --version
snforge --version
starkli --version
```

Expected output:
```
scarb 2.9.1 (aba4f604a 2024-11-29)
cairo: 2.9.1 (https://crates.io/crates/cairo-lang-compiler/2.9.1)
sierra: 1.6.0
snforge 0.34.0
0.3.5 (fa4f0e3)
```

## Part 2: Wallet and Account Setup

### Prerequisites
- Install Argent X wallet from Chrome/Brave store
- Get some test ETH for deployment

### Account Setup Steps

1. Get your credentials ready:
   - Export private key from Argent X (Settings → Export Private Key)
   - Copy wallet address from Argent X (Click account name to copy)

2. Create keystore:
```bash
# Create directory for credentials
mkdir -p ~/.starkli-wallets/deployer

# Create keystore (you'll be prompted for private key and password)
starkli signer keystore from-key ~/.starkli-wallets/deployer/keystore.json
```

3. Set up account configuration:
```bash
# Set keystore environment variable
export STARKNET_KEYSTORE=~/.starkli-wallets/deployer/keystore.json

# Fetch account (replace with your wallet address)
starkli account fetch 0x0097d970badaA2bc56489017BEe7d7b5fCDF0c15Fe75593A21972b12553d52a4 --output ~/.starkli-wallets/deployer/account.json

# Set account environment variable
export STARKNET_ACCOUNT=~/.starkli-wallets/deployer/account.json
```

## Part 3: Project Creation and Contract Deployment

### Create New Project
```bash
# Create and enter project directory
mkdir ~/starknet-workshop && cd ~/starknet-workshop

# Initialize a new project
snforge init my_project
cd my_project
```

### Deploy Contract

1. Build the contract:
```bash
scarb build
```

2. Declare the contract:
```bash
starkli declare target/dev/my_project_HelloStarknet.contract_class.json
```
Save the Class Hash from the output.

3. Deploy the contract:
```bash
starkli deploy <CLASS_HASH>
```
Replace `<CLASS_HASH>` with the hash received from the declare command.

## Troubleshooting

If commands are not found after installation:
1. Source your shell configuration: `source ~/.zshrc`
2. Verify ASDF installation: `which asdf`
3. Check PATH: `echo $PATH`
4. Make sure you've restarted your terminal after Starkli installation