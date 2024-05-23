// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";

/**
 * @notice A contract that stores offer tokens.
 */
contract OfferToken is ERC721URIStorage, FunctionsClient {
    struct Content {
        address recipient;
        uint paymentAmount;
        address paymentToken;
        uint createdDate;
        uint acceptDate;
        string completeDataURI;
        uint completeDate;
        uint confirmDate;
        bool confirmed;
    }

    uint private _nextTokenId;
    mapping(uint tokenId => Content content) private _contents;
    bytes32 private _functionsDonId;
    address private _functionsRouter;

    constructor(
        bytes32 functionsDonId,
        address functionsRouter
    ) ERC721("Offer Token", "OFRT") FunctionsClient(functionsRouter) {
        _functionsDonId = functionsDonId;
        _functionsRouter = functionsRouter;
    }

    function create(
        address recipient,
        uint paymentAmount,
        address paymentToken,
        string memory uri
    ) public {
        uint256 tokenId = _nextTokenId++;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        Content memory content;
        content.recipient = recipient;
        content.paymentAmount = paymentAmount;
        content.paymentToken = paymentToken;
        content.createdDate = block.timestamp;
        _contents[tokenId] = content;
    }

    // TODO: Check deadline
    function accept(uint tokenId) public {
        // Checks
        require(_contents[tokenId].recipient == msg.sender, "Not recipient");
        require(_contents[tokenId].acceptDate == 0, "Already accepted");
        // Send tokens to contract
        require(
            IERC20(_contents[tokenId].paymentToken).transferFrom(
                _ownerOf(tokenId),
                address(this),
                _contents[tokenId].paymentAmount
            ),
            "Failed to transfer payment to contract"
        );
        // Update content
        _contents[tokenId].acceptDate = block.timestamp;
    }

    // TODO: Check deadline
    function complete(uint tokenId, string memory completeDataURI) public {
        // Checks
        require(_contents[tokenId].recipient == msg.sender, "Not recipient");
        require(_contents[tokenId].acceptDate != 0, "Not accepted");
        require(_contents[tokenId].completeDate == 0, "Already completed");
        // Update content
        _contents[tokenId].completeDataURI = completeDataURI;
        _contents[tokenId].completeDate = block.timestamp;
    }

    function confirm(uint tokenId) public {
        // Checks
        require(_contents[tokenId].recipient == msg.sender, "Not recipient");
        require(_contents[tokenId].completeDate != 0, "Not completed");
        require(_contents[tokenId].confirmDate == 0, "Already confirmed");
        // Confirm without using functions
        if (_functionsDonId == 0x0 || _functionsRouter == address(0)) {
            _contents[tokenId].confirmDate = block.timestamp;
            _contents[tokenId].confirmed = true;
            require(
                IERC20(_contents[tokenId].paymentToken).transfer(
                    _contents[tokenId].recipient,
                    _contents[tokenId].paymentAmount
                ),
                "Failed to transfer payment to recipient"
            );
        }
        // Confirm with using functions
        else {
            // TODO: Send functions request
        }
    }

    // TODO: Implement function for automation
    // TODO: Send only one request for one token in one time
    function confirmBatch() public {}

    function getNextTokenId() public view returns (uint nextTokenId) {
        return _nextTokenId;
    }

    function getContent(
        uint tokenId
    ) public view returns (Content memory content) {
        return _contents[tokenId];
    }

    // TODO: Get functions response and update tokens
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {}
}
