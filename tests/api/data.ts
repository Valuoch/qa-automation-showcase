// Test-data builder: every run creates its own booking with a unique name, so tests never
// depend on (or collide with) data other people have left on the shared demo API.
export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
}

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const unique = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
  return {
    firstname: 'QA',
    lastname: `Showcase-${unique}`,
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-14' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
