pragma solidity ^0.4.4;


contract MovieEvent {
  
  enum TicketType{
      
      PRESOLD,
      SOLD
  }
  
  struct Ticket {
    address owner;
    string  seat;
    TicketType t;
  }
  
  mapping (string => Ticket) tickets; // tickets[owner]
  mapping (uint   => string) index;
  
  uint16  public theaterId;   // ID of the movie theather
  uint    public ticketPrice; // Price of the ticket
  uint    public date;        // Date of the event
  uint    public end;         // End of the event 
  uint    public nTicket;     // Number of tickets per event
  uint    public nSoldTicket; // Number of sold ticket
  address public owner;


  function MovieEvent(uint16 _theaterId,   
                      uint   _ticketPrice,
                      uint   _nTicket,
                      uint   _date,
                      uint   _end
                     ) public
    {
        date        = _date;
        end         = _end;
        theaterId   = _theaterId;
        ticketPrice = _ticketPrice;
        nTicket     = _nTicket;
        owner       = msg.sender;
        nSoldTicket = 0;
    }
    
    function cancel() public {
        
        require(now < date);
        require(owner == msg.sender);
        end = 0;
        date = 0;
        for (uint i = 0 ; i < nSoldTicket ; i++ ){
            tickets[index[i]].owner.transfer(ticketPrice);
            delete tickets[index[i]];
            delete index[i];
        }
    }
    
    function buyTicket(string seat) public payable {
        buyTicket(seat,TicketType.SOLD);
    }
    
    function buyTicket(string seat, TicketType t) internal {
        assert(nSoldTicket <= nTicket);
        require(msg.value == ticketPrice); // The value sent must be equal to the ticket price 
        require(now < date);            // The purchase date must be lesser than the date of the event
        require(msg.sender != owner);      // Movie theater not allowed to buy tickets
        require(tickets[seat].owner == 0); // unsold ticket
        require(nTicket > 1);
        
        Ticket memory ticket = Ticket(msg.sender, seat, t);
        tickets[seat] = ticket;
        index[nSoldTicket++] = seat;
    }
    
    function prebuyTicket(string seat) public payable {
        buyTicket(seat, TicketType.PRESOLD);
        owner.transfer(msg.value);
    }
    
    function isOwner(string seat) public view returns (bool){
        Ticket storage t = tickets[seat];
        return  t.owner == msg.sender;
    }
    
    function ticketType(string seat) public view returns (TicketType){
        Ticket storage ticket = tickets[seat];
        require(ticket.owner != 0);
        return ticket.t;
    }
    
    function close() public {
        require(now > date);
        require(owner == msg.sender);
        end = 0;
        date = 0;
        for (uint i = 0 ; i < nSoldTicket ; i++ ){
            // tickets[index[i]].owner.transfer(ticketPrice);
            delete tickets[index[i]];
            delete index[i];
        }
    }
}

contract MovieTheater {
  // mapping (uint8 => MovieEvent) events;
  mapping (uint8 => MovieEvent[]) public eventsInTheater;
  uint8 public nTheater;
  address owner;

  function MovieTheater() public {
    owner = msg.sender;
  }

  function setNumberOfTheaters(uint8 _nTheater) public {
    nTheater = _nTheater;
    // uint8 i;
    // for (i = 0 ; i < nTheater ; i++){
    //   eventsInTheater[i] = new MovieEvent[](0);
    // }
  }

  function createEvent( uint8 theaterId,
                        uint  ticketPrice,
                        uint8 nTicket,
                        uint  start,
                        uint  end)
  public returns (MovieEvent){

    require(0 <= theaterId && theaterId < nTheater); // The ID should be correct
    require(nTicket >= 1);
    require(start > now);
    uint16 i;
    int16 j = -1;
    MovieEvent[] storage e = eventsInTheater[theaterId];
    
    for (i = 0 ; i < e.length ; i++){
      if (e[i].end() == 0) {
        j = int16(i);
        continue;
      } 
      else {
        uint _start = e[i].date();
        uint _end   = e[i].end();
        require(!((_start <= start && start <= _end) || 
                  (_start <= end   && end   <= _end)));
      }
    }

    MovieEvent ev = new MovieEvent(theaterId, ticketPrice, nTicket, start, end);

    if (j == -1){  
      eventsInTheater[theaterId].push(ev);
    } else {
      eventsInTheater[theaterId][uint16(j)] = ev;
    }
  }

  function getEventsInTheater(uint8 theaterId) public view returns (MovieEvent[]){
    require(0 <= theaterId && theaterId < nTheater);
    return eventsInTheater[theaterId];
  }
  function _length(uint8 theaterId) public view returns (uint){
    require(0 <= theaterId && theaterId < nTheater);
    MovieEvent[] storage e = eventsInTheater[theaterId];
    return e.length;
  }
  
  function clearTheater(uint8 theaterId) public {
        uint8 i = 0;
        for (i = 1 ; i < eventsInTheater[theaterId].length ; i++ ){
            delete eventsInTheater[theaterId][i];
        }
  }
}


//1,18000,100,1513161000,1513171800