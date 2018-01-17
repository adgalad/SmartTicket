pragma solidity ^0.4.18;

/**
 * The Event contract
*/

contract OwnerOnly {
  address owner;
  modifier ownerOnly() { 
    require(owner == tx.origin);
    _; 
  }
}


contract Event is OwnerOnly {
  struct Ticket{
    bytes32 hashID;
    bytes32 hashDelegate;
    uint32  price;  
  }

  mapping (uint32 => Ticket) public tickets;
  uint32 public nSeat;
  uint64 public date;
  string public name;
  string public place;
  
  // Options
  bool public _canResell;
  bool public _canDelegate;
  bool public _canReturn;

  /* Constructor */
  function Event (string _name,  string _place,  uint64 _date,
                  uint32 _nSeat, bool   _resell, bool   _delegate, 
                  bool   _return) 
  public
  {
    name     = _name;
    place    = _place;
    date     = _date;
    nSeat    = _nSeat;
    _canResell   = _resell;
    _canDelegate = _delegate;
    _canReturn = _return;
    owner    = tx.origin;
  }    

  /* Operations */ 
  function buyTicket(bytes32 buyer, uint32 seat, uint32 price, bytes32 delegated) 
  public canDelegate(delegated) onTime() ownerOnly() 
  {
    require(tickets[seat].hashID == 0);
    Ticket memory t;
    t.hashID       = buyer; 
    t.hashDelegate = delegated;
    t.price        = price;
    tickets[seat]  = t;
  }

  function resellTicket(bytes32 ticketOwner, bytes32 buyer, uint32 seat,
                        uint32  price, bytes32 delegated) 
  public canResell() canDelegate(delegated) onTime() ownerOnly() 
  {
    require(tickets[seat].hashID == ticketOwner);
    require(tickets[seat].hashID != 0 && tickets[seat].hashID != buyer);
    tickets[seat].hashID = buyer;
    tickets[seat].price  = price;
    tickets[seat].hashDelegate = delegated;
  }

  function returnTicket(bytes32 ticketOwner, uint32 seat)
  public canReturn() onTime() ownerOnly()
  {
    require(tickets[seat].hashID == ticketOwner);
    delete(tickets[seat]);
  }

  /* Only Read */
  function getInfo() public view returns(string, string, uint64, uint32, bool, bool, bool) {
    return (name, place, date, nSeat, _canResell, _canDelegate, _canReturn);
  }

  function getTicket(uint32 seat) public view returns(Ticket){
    return tickets[seat];
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
    require(!_canDelegate || delegated == 0);
    _;
  }

  modifier canResell(){
    require(_canResell);
    _;
  }

  modifier canReturn(){
    require(_canReturn);
    _;
  }

  modifier onTime(){
    require(date < now);
    _;
  }

}

contract EventPromoter is OwnerOnly {
  mapping (address => Event) public events;
  string public name;
  Event[] _events;

  function EventPromoter(string _name) public{
    name = _name;
    owner = tx.origin;
  }

  function createEvent (string _name,  string place,  uint64 date,
                        uint32 nSeat, bool   resell, bool   delegate,
                        bool canReturn) 
  public ownerOnly() returns (address){
    Event e = new Event(_name, place, date, nSeat, resell, delegate, canReturn);
    events[address(e)] = e;
    _events.push(e);
    return address(e);
  }

  function deleteEvent (address addr) public ownerOnly() {
    delete events[addr];
  }

  function listEvents() public view returns(Event[]){
    return _events;
  }
}

/*
 * The contract Admin is the responsable of 
 * creating new EventPromoters. Is the first contract
 * deployed when the application is launched
 */
contract Admin is OwnerOnly {
  mapping (address => EventPromoter) public promoters;
  EventPromoter[] _promoters;

  function Admin() public {
    owner = tx.origin;
  }

  function createPromoter(string name) public ownerOnly() returns(address){
    EventPromoter p = new EventPromoter(name);
    promoters[address(p)] = p;
    _promoters.push(p);
    return address(p);
  }

  function listPromoters()public view returns(EventPromoter[]){
    return _promoters;
  }

}


