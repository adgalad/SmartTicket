pragma solidity ^0.4.18;

/**
 * The Event contract
*/

contract OwnerOnly {
  address owner;
  modifier ownerOnly() { 
    require(owner == msg.sender);
    _; 
  }
}

contract Event is OwnerOnly {

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

  /* Constructor */
  function Event (string _name,  string _place,  uint64 _date,
                  uint32 _nSeat, bool   _resell, bool   _delegate) 
  public
  {
    name     = _name;
    place    = _place;
    date     = _date;
    nSeat    = _nSeat;
    resell   = _resell;
    delegate = _delegate;
    owner    = msg.sender;
  }    

  /* Operations */ 
  function buyTicket(bytes32 buyer, uint32 seat, bytes32 delegated) 
  public canDelegate(delegated) onTime() ownerOnly() {
    require(tickets[seat].hashID == 0);
    Ticket memory t;
    t.hashID       = buyer; 
    t.hashDelegate = delegated;
    tickets[seat]  = t;
  }

  function resellTicket(bytes32 buyer, uint32 seat) 
  public canResell() onTime() ownerOnly() {
    require(tickets[seat].hashID != 0 && tickets[seat].hashID != buyer);
    tickets[seat].hashID = buyer;
  }
  

  /* Setters */
  function changeDate(uint64 newDate) public onTime() ownerOnly() {
    date = newDate;
  }

  function changeName (string newName) public onTime() ownerOnly() {
    name = newName;
  }

  function changePlace (string newPlace) public onTime() ownerOnly() {
    place = newPlace;
  }


  /* Modifiers */
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

}

contract EventPromoter is OwnerOnly {
  mapping (address => Event) public events;

  function EventPromoter() public {
    owner = msg.sender;
  }

  function createEvent (string name,  string place,  uint64 date,
                        uint32 nSeat, bool   resell, bool   delegate) 
  public ownerOnly() returns (address)
  {
    Event e = new Event(name, place, date, nSeat, resell, delegate);
    events[address(e)] = e;
    return address(e);
  }

  function deleteEvent (address addr) public ownerOnly() {
    delete events[addr];
  }
}

/*
 * The contract Admin is the responsable of 
 * creating new EventPromoters. Is the first contract
 * deployed when the application is launched
 */
contract Admin is OwnerOnly {
  mapping (address => EventPromoter) public promoters;

  function Admin() public {
    owner = msg.sender;
  }

  function createPromoter() public ownerOnly() returns(address){
    EventPromoter p = new EventPromoter();
    promoters[address(p)] = p;
    return address(p);
  }
}


