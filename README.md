# 🕺️ Influence Agent

A platform that helps companies find influencers, send them tasks to promote their products and control the process through smart contracts and AI.

## 🛠️ Technologies

- **Avalanche Fuji**, **Polygon Cardona** and **Scroll Sepolia** networks are using for smart contracts that handle all operations from creating profiles and offers to verifying tasks and sending payments.
- **Chainlink Functions** is used to send requests to **Telegram** and **OpenAI** to obtain posts and verify that they satisfy a company's requirements.
- **Chainlink Automation** is used for a cron job that regularly checks for completion of active offers.

## 🔗 Artifacts

- Application - [influence-agent.vercel.app](https://influence-agent.vercel.app/)
- Contracts (**Avalanche Fuji**):
  - Offer Token - [0x8364a4F0468d59ffFc47768047a30e50aC21Fe15](https://testnet.snowscan.xyz/address/0x8364a4F0468d59ffFc47768047a30e50aC21Fe15)
  - USD Token - [0x96E6AF6E9e400d0Cd6a4045F122df22BCaAAca59](https://testnet.snowscan.xyz/address/0x96E6AF6E9e400d0Cd6a4045F122df22BCaAAca59)
  - Profile Token - [0x9a1C3C845BAd2585210913914Bf88242460062E9](https://testnet.snowscan.xyz/address/0x9a1C3C845BAd2585210913914Bf88242460062E9)
  - Chainlink Functions Subscription - [8661](https://functions.chain.link/fuji/8661)
  - Chainlink Automation Upkeep - [110929698750700214590658358699623082773002932154477646668917163876245152609837](https://automation.chain.link/fuji/110929698750700214590658358699623082773002932154477646668917163876245152609837)
- Contracts (**Polygon Cardona**):
  - Offer Token - [0x96E6AF6E9e400d0Cd6a4045F122df22BCaAAca59](https://cardona-zkevm.polygonscan.com/address/0x96E6AF6E9e400d0Cd6a4045F122df22BCaAAca59)
  - USD Token - [0x02008a8DBc938bd7930bf370617065B6B0c1221a](https://cardona-zkevm.polygonscan.com/address/0x02008a8DBc938bd7930bf370617065B6B0c1221a)
  - Profile Token - [0xFe0AeD5cBEE89869FF505e10A5eBb75e9FC819D7](https://cardona-zkevm.polygonscan.com/address/0xFe0AeD5cBEE89869FF505e10A5eBb75e9FC819D7)
- Contracts (**Scroll Sepolia**):
  - Offer Token - [0xC3d9DcfD747795c7F6590B51b44478a0EE7d02F1](https://sepolia.scrollscan.com/address/0xC3d9DcfD747795c7F6590B51b44478a0EE7d02F1)
  - USD Token - [0x9b18515b74eF6115A673c6D01C454D8F72f84177](https://sepolia.scrollscan.com/address/0x9b18515b74eF6115A673c6D01C454D8F72f84177)
  - Profile Token - [0x4F316c6536Ce3ee94De802a9EfDb20484Ec4BDF9](https://sepolia.scrollscan.com/address/0x4F316c6536Ce3ee94De802a9EfDb20484Ec4BDF9)

## 🏗️ Architecture

![Architecture](/Architecture.png)
