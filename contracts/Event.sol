pragma solidity ^0.4.19;

/**
 * The Event contract
 */
contract Event {

  struct Ticket {
    bytes32 hashID;
    bytes32 hashDelegate;
  }
  

  mapping (uint32 => Ticket) public tickets;
  uint32 public nSeat;
  uint64 public date;
  string public name;
  string public place;

  // Options
  bool public resell;
  bool public delegate;

  function Event ( string _name,  string _place,  uint64 _date,
                   uint32 _nSeat, bool   _resell, bool   _delegate) 
  public {
    name     = _name;
    place    = _place;
    date     = _date;
    nSeat    = _nSeat;
    resell   = _resell;
    delegate = _delegate;
  }  

  modifier canDelegate(bytes32 delegated) {
    require( (delegated == 0) != delegate);
    _;
  }

  modifier canResell(){
    require(resell);
    _;
  }

  modifier onTime(){
    require(date < now);
    _;
  }

  function buyTicket(bytes32 owner, uint32 seat, bytes32 delegated) 
  public canDelegate(delegated) {
    require(tickets[seat].hashID == 0);
    Ticket memory t;
    t.hashID       = owner; 
    t.hashDelegate = delegated;
    tickets[seat]  = t;
  }

  function resellTicket(bytes32 newOwner, uint32 seat) 
  public canResell() onTime(){
    require(tickets[seat].hashID != 0 && tickets[seat].hashID != newOwner);
    tickets[seat].hashID = newOwner;
  }

  function changeDate(uint64 newDate) public onTime(){
    date = newDate;
  }
}

