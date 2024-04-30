//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

library SafeMath {
    function tryAdd(
        uint256 a,
        uint256 b
    ) internal pure returns (bool, uint256) {
        unchecked {
            uint256 c = a + b;
            if (c < a) return (false, 0);
            return (true, c);
        }
    }

    function trySub(
        uint256 a,
        uint256 b
    ) internal pure returns (bool, uint256) {
        unchecked {
            if (b > a) return (false, 0);
            return (true, a - b);
        }
    }

    function tryMul(
        uint256 a,
        uint256 b
    ) internal pure returns (bool, uint256) {
        unchecked {
            // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
            // benefit is lost if 'b' is also tested.
            // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
            if (a == 0) return (true, 0);
            uint256 c = a * b;
            if (c / a != b) return (false, 0);
            return (true, c);
        }
    }

    function tryDiv(
        uint256 a,
        uint256 b
    ) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a / b);
        }
    }

    function tryMod(
        uint256 a,
        uint256 b
    ) internal pure returns (bool, uint256) {
        unchecked {
            if (b == 0) return (false, 0);
            return (true, a % b);
        }
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        return a + b;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return a - b;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        return a * b;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return a / b;
    }

    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return a % b;
    }

    function sub(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b <= a, errorMessage);
            return a - b;
        }
    }

    function div(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a / b;
        }
    }

    function mod(
        uint256 a,
        uint256 b,
        string memory errorMessage
    ) internal pure returns (uint256) {
        unchecked {
            require(b > 0, errorMessage);
            return a % b;
        }
    }
}


// Parent Smart contract that keeps funds
interface IMainContract{
    function approveRequest(address borrower, uint256 id, string memory tokenURI) external;
    function mintTokens(address lender, uint256 tokenAmount) external;
    function claimBackUSDT(address lender, uint256 totalClaimAmount) external;
    function depositUSDTToBorrower(address to,uint256 usdtAmount) external;
        function depositUSDT(address from,address to,uint256 usdtAmount,uint256 principal) external;

    function burnNFT(uint256 _tokenId) external;

}

contract LendingBorrowing is Ownable {

    using SafeMath for uint256;
    IMainContract public mainContract;


    uint256 daysInterval = 30 days;
    // uint256 public interestPercentage = 4;
    uint256 public yieldPercentage = 2;
    uint256 public divider = 100;

    uint256 public borrowerId = 0;

    IERC20 public USDT;
    enum RepaymentFrequency {MONTHLY,ONETIME}
    enum BorrowerStatus {FINANCEREQUEST,TOKENIZED,LENDING,CLOSED,REPAYMENT}

    event LoanRequested(address indexed borrower, uint256 indexed loanAmount, uint256 indexed loanPeriod);
    event LoanApproved(address indexed borrower,uint256 indexed principal, uint256 indexed id);
    event loanRepaid(address indexed borrower,uint256 indexed loanAmount,uint256 indexed id);
    event fundsDeposited(address indexed lender, uint256 indexed usdtAmount, uint256 indexed lenderToBorrowerId);
    event fundsApproved(address indexed lender, uint256 indexed usdtAmount, uint256 indexed lenderToBorrowerId);
    event fundsClaimed(address indexed lender, uint256 indexed usdtAmount);


    struct BorrowerDetails {
        uint256 id;
        address borrower;
        uint256 principal;
        uint256 interest;
        uint256 loanTerm;
        uint256 loanStartDate;
        uint256 loanMaturityDate;
        uint256 lastRepaidTime;
        uint256 paymentsPaid;
        uint256 totalPayments;
        string tokenURI;
        bool fundsReceived;
      
    }

    struct LenderDetails{
        uint256 id;
        address lender;
        uint256 usdtAmount;
        uint256 lendTime;
        uint256 claimTime;
        bool claimed;
    }

    mapping(address => BorrowerDetails) public borrowerDetails;
    mapping(address =>BorrowerStatus) public borrowerStatus;
    // mapping(address =>uint256) public borrowerNFTId;
    address[] public borrowers;

    mapping(address => LenderDetails) public lenderDetails;
    address[] public lenders;
    mapping(address =>uint256) lenderToBorrowerId;


    constructor(address _mainContract){
     mainContract =  IMainContract(_mainContract);
    }
     //status can be 0,1,2,3 or 4
     function setBorrowerStatus(address _borrower,BorrowerStatus _status) public onlyOwner{
        
      address borrower = borrowerDetails[_borrower].borrower;
        // require(borrowerExist(borrower), "Invalid ID");
      BorrowerStatus previousStatus = borrowerStatus[_borrower];
       if(_status == BorrowerStatus.FINANCEREQUEST){
      require(!borrowerExist(borrower),"invalid status setting");
      borrowerStatus[_borrower] = _status;
      }
      else if(_status == BorrowerStatus.TOKENIZED){
       require(borrowerExist(borrower),"invalid status setting");
       require(previousStatus == BorrowerStatus.FINANCEREQUEST, "previous status must be finance request");
       borrowerStatus[_borrower] = _status;
      }
      else if(_status == BorrowerStatus.LENDING ){
        require(previousStatus == BorrowerStatus.TOKENIZED, "previous status must be tokenized");
        borrowerStatus[_borrower] = _status;

      }
      else if(_status == BorrowerStatus.CLOSED ){
        require(previousStatus == BorrowerStatus.LENDING,"previous status must be lending");
        borrowerStatus[_borrower] = _status;
      }
      else if(_status == BorrowerStatus.REPAYMENT){
       require(previousStatus == BorrowerStatus.CLOSED,"previous status must be closed");
        borrowerStatus[_borrower] = _status;
      }
     }

    function storeBorrowerDetails(
        address _borrower,
        uint256 _principal,
        uint256 _loanTerm,
        string memory _tokenURI,
        uint256 _interestPercentage
    ) public onlyOwner {
        require(!borrowerExist(_borrower), "Borrower already exist");
        uint256 interest = _principal.mul(_interestPercentage).div(divider);
        uint256 loanMaturityDate = daysInterval.mul(_loanTerm);
        uint256 totalPayments = _loanTerm;
        uint256 currentId = borrowerId++;
        borrowerDetails[_borrower] = BorrowerDetails(
            currentId,
            _borrower,
            _principal,
            interest,
            _loanTerm,
            block.timestamp,
            block.timestamp.add(loanMaturityDate),
            0,
            0,
            totalPayments,
            _tokenURI,
            false
        );
         borrowers.push(_borrower);
         
    }
    function approveloan(address _borrower) external onlyOwner{
        uint256 principal = borrowerDetails[_borrower].principal;
        address borrower = borrowerDetails[_borrower].borrower;
        string memory tokenURI = borrowerDetails[_borrower].tokenURI;
         uint256 Id = borrowerDetails[_borrower].id;
         mainContract.approveRequest(borrower,Id, tokenURI);
         borrowerDetails[_borrower].fundsReceived = true;
         emit LoanApproved(borrower,principal, Id);
    }

    function repayLoan(address _borrower,uint256 _amount, address _lender) public onlyOwner{
        require(borrowerExist(_borrower),"borrower does not exist");
        uint256 borrowerInterest = borrowerDetails[_borrower].interest;
        uint256 borrowerPrincipal =  borrowerDetails[_borrower].principal;
        uint256 totalAmount = borrowerPrincipal +  borrowerInterest;
        require(totalAmount == _amount, "not enough repayment. please check your total amount");
        // require(block.timestamp<=borrowerDetails[_borrower].loanMaturityDate, "your deadline of paying back loan has passed");
        mainContract.depositUSDT(_borrower,_lender,_amount,borrowerPrincipal);
        uint256 id = borrowerDetails[_borrower].id;
         // borrower first need to approve
        mainContract.burnNFT(id);
        emit loanRepaid(borrowerDetails[_borrower].borrower,totalAmount,id);
    }


    // Lender depositing USDT
    function depositFunds(uint256 _usdtAmount, address _borrower) public{
        address borrower = borrowerDetails[_borrower].borrower;
        require(borrowerExist(borrower), "borrower does not exist");
        require(_usdtAmount == borrowerDetails[_borrower].principal, "not enough funds for this borrower");
        require(borrowerDetails[_borrower].fundsReceived == false,"someone already deposited funds for this borrower");
        mainContract.depositUSDTToBorrower(_borrower,_usdtAmount);   
        uint256 id =  borrowerDetails[_borrower].id;
        lenderToBorrowerId[_msgSender()] = id;
        emit fundsDeposited(_msgSender(),_usdtAmount, id);
    }

    function storeLenderDetailsAndMintTokens(
        address _lender,
        uint256 _usdtAmount,
        address  _borrower
        ) public onlyOwner {
        uint256 id = lenderToBorrowerId[_lender];
        uint loanTerm = borrowerDetails[_borrower].loanTerm;
        uint256 claimTime = daysInterval.mul(loanTerm);
        lenderDetails[_lender] = LenderDetails(id,_lender,_usdtAmount,block.timestamp,block.timestamp.add(claimTime),false);
        lenders.push(_lender);
        emit fundsApproved(_lender,_usdtAmount, id);
    }

    function claimFunds(address _lender) public onlyOwner{
   
        require(lenderExist(_lender),"lender does not exist");
        bool claimed = lenderDetails[_lender].claimed;
        require(!claimed, "You have already claimed");
        require(block.timestamp> lenderDetails[_lender].claimTime, "Please wait for your claimBack Time");
        uint256 lendedAmount = lenderDetails[_lender].usdtAmount;
        uint256 claimAmountPercentage = lendedAmount.mul(yieldPercentage).div(divider);
        uint256 claimAmount = lendedAmount.add(claimAmountPercentage);
        mainContract.claimBackUSDT(_lender,claimAmount);
        lenderDetails[_lender].claimed = true;
        lenderDetails[_lender].usdtAmount = 0;
        emit fundsClaimed(_lender,claimAmount);
    }


    function getLenderToBorrowerId(address _lender) public view returns(uint256){
        return lenderToBorrowerId[_lender];

    }
    function borrowerExist(address _borrower) public view returns(bool){
        for(uint256 i = 0; i<borrowers.length; i++){
          if(borrowers[i] ==_borrower){
            return true;
          }
        }
        return false;
    }
    function lenderExist(address _lender) public view returns(bool){
          for(uint256 i = 0; i<lenders.length; i++){
          if(lenders[i] ==_lender){
            return true;
          }
        }
        return false;
    }
    function getBorrowerDetails(address _borrower) public view returns(BorrowerDetails memory){
        address user = borrowerDetails[_borrower].borrower;
        require(borrowerExist(user), "borrower does not exist");
        return borrowerDetails[_borrower];
    }
    function getLenderDetails(address _lender) public view returns(LenderDetails memory){
        require(lenderExist(_lender), "Lender does not exist");
        return lenderDetails[_lender];
    }
    function getBorrowerStatus(address _borrower) public view returns(string memory _status){
        BorrowerStatus status = borrowerStatus[_borrower];
        if(status == BorrowerStatus.FINANCEREQUEST ){
            _status = "FINANCEREQUEST";
        }
        else if(status == BorrowerStatus.TOKENIZED){
           _status = "TOKENIZED";
        }
         else if(status == BorrowerStatus.LENDING){
           _status = "LENDING";
        }
         else if(status == BorrowerStatus.CLOSED){
           _status = "CLOSED";
        }
         else if(status == BorrowerStatus.REPAYMENT){
           _status = "REPAYMENT";
        }
        
    }

    function getBorrowerId(address _borrower)public view returns(uint256){
       require(borrowerExist(_borrower), "borrower does not exist");
       return (borrowerDetails[_borrower].id);
    }

}