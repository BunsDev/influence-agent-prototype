// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @notice A contract that stores offer tokens.
 */
contract OfferToken is ERC721URIStorage, FunctionsClient {
    using FunctionsRequest for FunctionsRequest.Request;

    struct Content {
        address recipient;
        uint paymentAmount;
        address paymentToken;
        uint createdDate;
        uint acceptDate;
        string completeDataURI;
        uint completeDate;
        uint closeDate;
        bool closeSuccess;
    }

    uint private _nextTokenId;
    mapping(uint tokenId => Content content) private _contents;
    mapping(bytes32 requestId => uint tokenId) private _functionRequests;
    bytes32 private _functionsDonId;
    address private _functionsRouter;
    uint64 private _functionsSubscriptionId;

    string _functionsSource =
        "const tokenUri = args[0];"
        "const tokenCompleteDataUri = args[1];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "url: `https://influence-agent.vercel.app/api/verifier/${encodeURIComponent(tokenUri)}/${encodeURIComponent(tokenCompleteDataUri)}`"
        "});"
        "if (apiResponse.error) {"
        "throw Error('Request failed');"
        "}"
        "const { data } = apiResponse;"
        "return Functions.encodeString(data.result);";

    uint32 _functionsGasLimit = 300000;

    constructor(
        bytes32 functionsDonId,
        address functionsRouter,
        uint64 functionsSubscriptionId
    ) ERC721("Offer Token", "OFRT") FunctionsClient(functionsRouter) {
        _functionsDonId = functionsDonId;
        _functionsRouter = functionsRouter;
        _functionsSubscriptionId = functionsSubscriptionId;
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

    function complete(uint tokenId, string memory completeDataURI) public {
        // Checks
        require(_contents[tokenId].recipient == msg.sender, "Not recipient");
        require(_contents[tokenId].acceptDate != 0, "Not accepted");
        require(_contents[tokenId].completeDate == 0, "Already completed");
        // Update content
        _contents[tokenId].completeDataURI = completeDataURI;
        _contents[tokenId].completeDate = block.timestamp;
    }

    function close(uint tokenId) public {
        // Checks
        require(_contents[tokenId].recipient == msg.sender, "Not recipient");
        require(_contents[tokenId].completeDate != 0, "Not completed");
        require(_contents[tokenId].closeDate == 0, "Already closed");
        // Close without functions
        if (
            _functionsDonId == 0x0 ||
            _functionsRouter == address(0) ||
            _functionsSubscriptionId == 0
        ) {
            _contents[tokenId].closeDate = block.timestamp;
            _contents[tokenId].closeSuccess = true;
            require(
                IERC20(_contents[tokenId].paymentToken).transfer(
                    _contents[tokenId].recipient,
                    _contents[tokenId].paymentAmount
                ),
                "Failed to transfer payment to recipient"
            );
        }
        // Close using functions
        else {
            _sendRequest(tokenId);
        }
    }

    // TODO: Implement function for automation
    // TODO: Send only one request for one token in one time
    function closeBatch() public {}

    function getNextTokenId() public view returns (uint nextTokenId) {
        return _nextTokenId;
    }

    function getContent(
        uint tokenId
    ) public view returns (Content memory content) {
        return _contents[tokenId];
    }

    function _sendRequest(uint tokenId) private {
        // Define args
        string[] memory args = new string[](2);
        args[0] = tokenURI(tokenId);
        args[1] = _contents[tokenId].completeDataURI;
        // Define request
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(_functionsSource);
        req.setArgs(args);
        // Send and save request
        bytes32 requestId = _sendRequest(
            req.encodeCBOR(),
            _functionsSubscriptionId,
            _functionsGasLimit,
            _functionsDonId
        );
        _functionRequests[requestId] = tokenId;
    }

    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        // Define token
        uint tokenId = _functionRequests[requestId];
        // Update contents
        if (keccak256(bytes(response)) == keccak256(bytes("success"))) {
            _contents[tokenId].closeDate = block.timestamp;
            _contents[tokenId].closeSuccess = true;
        }
        if (keccak256(bytes(response)) == keccak256(bytes("fail"))) {
            _contents[tokenId].closeDate = block.timestamp;
            _contents[tokenId].closeSuccess = false;
        }
        // Send tokens to recipient
        if (
            _contents[tokenId].closeDate != 0 && _contents[tokenId].closeSuccess
        ) {
            require(
                IERC20(_contents[tokenId].paymentToken).transfer(
                    _contents[tokenId].recipient,
                    _contents[tokenId].paymentAmount
                ),
                "Failed to transfer payment to recipient"
            );
        }
        // Send tokens to owner
        if (
            _contents[tokenId].closeDate != 0 &&
            !_contents[tokenId].closeSuccess
        ) {
            require(
                IERC20(_contents[tokenId].paymentToken).transfer(
                    _ownerOf(tokenId),
                    _contents[tokenId].paymentAmount
                ),
                "Failed to transfer payment to owner"
            );
        }
    }
}
