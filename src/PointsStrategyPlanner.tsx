import React, { useEffect, useMemo, useState } from 'react';

type Card = {
  id: string;
  name: string;
  issuer: string;
  currency:
    | 'Membership Rewards'
    | 'Ultimate Rewards'
    | 'Capital One Miles'
    | 'Hilton Honors'
    | 'ThankYou Points'
    | 'Cashback';
  tags?: string[];
};

const ALL_CARDS: Card[] = [
  {
    id: 'capone-venture',
    name: 'Capital One Venture',
    issuer: 'Capital One',
    currency: 'Capital One Miles',
    tags: ['2x on everything'],
  },
  {
    id: 'amex-platinum',
    name: 'Amex Platinum (Personal)',
    issuer: 'American Express',
    currency: 'Membership Rewards',
    tags: ['5x flights'],
  },
  {
    id: 'amex-biz-platinum',
    name: 'Amex Platinum (Business)',
    issuer: 'American Express',
    currency: 'Membership Rewards',
    tags: ['5x flights', '35% rebate'],
  },
  {
    id: 'hilton-aspire',
    name: 'Amex Hilton Honors Aspire',
    issuer: 'American Express',
    currency: 'Hilton Honors',
    tags: ['14x Hilton', 'Diamond'],
  },
  {
    id: 'chase-ink-cash',
    name: 'Chase Ink Cash',
    issuer: 'Chase',
    currency: 'Ultimate Rewards',
    tags: ['5x office supply'],
  },
  {
    id: 'chase-ink-preferred',
    name: 'Chase Ink Preferred',
    issuer: 'Chase',
    currency: 'Ultimate Rewards',
    tags: ['3x travel & shipping'],
  },
  {
    id: 'chase-amazon-prime',
    name: 'Chase Amazon Prime',
    issuer: 'Chase',
    currency: 'Cashback',
    tags: ['5% Amazon'],
  },
  {
    id: 'chase-sapphire-preferred',
    name: 'Chase Sapphire Preferred',
    issuer: 'Chase',
    currency: 'Ultimate Rewards',
  },
  {
    id: 'chase-sapphire-reserve',
    name: 'Chase Sapphire Reserve',
    issuer: 'Chase',
    currency: 'Ultimate Rewards',
  },
  {
    id: 'amex-gold',
    name: 'Amex Gold',
    issuer: 'American Express',
    currency: 'Membership Rewards',
  },
  {
    id: 'capone-venturex',
    name: 'Capital One Venture X',
    issuer: 'Capital One',
    currency: 'Capital One Miles',
  },
  {
    id: 'citi-premier',
    name: 'Citi Strata Premier / Premier',
    issuer: 'Citi',
    currency: 'ThankYou Points',
  },
];

// Centralized partner sets
const PARTNERS = {
  AVIOS: ['ba', 'ib', 'qr'] as const, // BA/Iberia/Qatar
  STAR: ['ua', 'ac', 'tk', 'sq'] as const, // United, Air Canada, Turkish, Singapore
  SKY: ['afkl'] as const, // Air France/KLM
} as const;

const ALLIANCE_LABELS: Record<string, string> = {
  oneworld: 'oneworld',
  star: 'Star Alliance',
  skyteam: 'SkyTeam',
  ba: 'British Airways (Avios)',
  ib: 'Iberia (Avios)',
  qr: 'Qatar (Avios)',
  ua: 'United',
  ac: 'Air Canada (Aeroplan)',
  tk: 'Turkish (Miles&Smiles)',
  sq: 'Singapore (KrisFlyer)',
  afkl: 'Air France / KLM (Flying Blue)',
};

const ALLIANCES = [
  { id: 'oneworld', label: ALLIANCE_LABELS['oneworld'] },
  { id: 'star', label: ALLIANCE_LABELS['star'] },
  { id: 'skyteam', label: ALLIANCE_LABELS['skyteam'] },
  ...PARTNERS.AVIOS.map(id => ({ id, label: ALLIANCE_LABELS[id] })),
  ...PARTNERS.STAR.map(id => ({ id, label: ALLIANCE_LABELS[id] })),
  ...PARTNERS.SKY.map(id => ({ id, label: ALLIANCE_LABELS[id] })),
];

const HOTEL_PROGRAMS = [
  { id: 'marriott', label: 'Marriott Bonvoy' },
  { id: 'hilton', label: 'Hilton Honors' },
  { id: 'hyatt', label: 'World of Hyatt' },
  { id: 'ihg', label: 'IHG One Rewards' },
  { id: 'wyndham', label: 'Wyndham Rewards' },
  { id: 'choice', label: 'Choice Privileges' },
  { id: 'accor', label: 'Accor Live Limitless' },
];

const AIRPORTS = [
  { code: 'DFW', city: 'Dallas/Fort Worth', country: 'USA' },
  { code: 'DAL', city: 'Dallas (Love Field)', country: 'USA' },
  { code: 'IAH', city: 'Houston', country: 'USA' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA' },
  { code: 'JFK', city: 'New York (JFK)', country: 'USA' },
  { code: 'ORD', city: "Chicago (O'Hare)", country: 'USA' },
  { code: 'MIA', city: 'Miami', country: 'USA' },
  { code: 'MAD', city: 'Madrid', country: 'Spain' },
  { code: 'DOH', city: 'Doha', country: 'Qatar' },
  { code: 'LHR', city: 'London (Heathrow)', country: 'UK' },
  { code: 'CDG', city: 'Paris (CDG)', country: 'France' },
];

// Helpers
const inAny = (prefs: string[], set: readonly string[]) =>
  prefs.some(p => set.includes(p as any));
function useLocalState<T>(key: string, initial: T) {
  const isBrowser =
    typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  const [v, setV] = useState<T>(() => {
    if (!isBrowser) return initial;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    if (isBrowser) {
      try {
        localStorage.setItem(key, JSON.stringify(v));
      } catch {}
    }
  }, [isBrowser, v, key]);
  return [v, setV] as const;
}

// Valuation floors
const VAL_AIRLINE_MIN = 0.014;
const VAL_HILTON = 0.005;
const VAL_MARRIOTT = 0.007;
const VAL_HYATT = 0.02;

type Path = { source: string; to: string; via?: string; note?: string };
type PlanBlock = { title: string; details: string[]; paths?: Path[] };

function buildPlan({
  cards,
  airPrefs,
  hotelPrefs,
  airports,
}: {
  cards: string[];
  airPrefs: string[];
  hotelPrefs: string[];
  airports: string[];
}): PlanBlock[] {
  const plan: PlanBlock[] = [];
  const hasUR = cards.some(
    id => ALL_CARDS.find(c => c.id === id)?.currency === 'Ultimate Rewards'
  );
  const hasMR = cards.some(
    id => ALL_CARDS.find(c => c.id === id)?.currency === 'Membership Rewards'
  );
  const hasCapOne = cards.some(
    id => ALL_CARDS.find(c => c.id === id)?.currency === 'Capital One Miles'
  );
  const hasAspire = cards.includes('hilton-aspire');

  const useAviosTriangle =
    airPrefs.includes('oneworld') || inAny(airPrefs, PARTNERS.AVIOS);
  if (useAviosTriangle) {
    const paths: Path[] = [];
    if (hasMR)
      paths.push({
        source: 'Membership Rewards',
        to: 'BA/Iberia/Qatar Avios',
        note: `DFW: BA AA short-haul 7.5k; Iberia DFW–MAD 34k; Qatar QSuites ${airports[0]?.toUpperCase() || 'DFW'}–DOH 70k`,
      });
    if (hasUR)
      paths.push({
        source: 'Ultimate Rewards',
        to: 'BA/Iberia/Qatar Avios',
        note: 'UR→BA then move to Iberia/Qatar as needed',
      });
    if (hasCapOne)
      paths.push({
        source: 'Capital One Miles',
        to: 'BA/Iberia/Qatar Avios',
        note: '1:1; pick program with best space/price',
      });
    plan.push({
      title: 'Priority 1 — AA/oneworld via Avios Triangle',
      details: [
        'Search BA/Iberia/Qatar; move Avios between them after you find space.',
        'Earn MR 5x flights, UR 3x travel/5x office supply, CapOne 2x everywhere.',
      ],
      paths,
    });
  }

  // Star Alliance block
  if (airPrefs.includes('star') || inAny(airPrefs, PARTNERS.STAR)) {
    const paths: Path[] = [];
    if (hasMR)
      paths.push({
        source: 'Membership Rewards',
        to: 'Aeroplan / LifeMiles / Turkish',
        note: 'Star Alliance; Aeroplan stopovers +5k',
      });
    if (hasUR)
      paths.push({
        source: 'Ultimate Rewards',
        to: 'United / Aeroplan / KrisFlyer',
        note: 'United no YQ; SQ for premium cabins',
      });
    if (hasCapOne)
      paths.push({
        source: 'Capital One Miles',
        to: 'Aeroplan / LifeMiles / Turkish',
        note: 'Europe biz often 45–63k',
      });
    plan.push({
      title: 'Star Alliance Options (when selected)',
      details: [
        'Compare Aeroplan vs LifeMiles vs United; pick lowest miles/fees.',
        'Feed with Ink 3x/5x and Venture 2x.',
      ],
      paths,
    });
  }

  // SkyTeam block
  if (airPrefs.includes('skyteam') || inAny(airPrefs, PARTNERS.SKY)) {
    const paths: Path[] = [];
    if (hasMR)
      paths.push({
        source: 'Membership Rewards',
        to: 'Flying Blue (AF/KLM)',
        note: 'Monthly Promo Rewards to Europe',
      });
    if (hasUR)
      paths.push({
        source: 'Ultimate Rewards',
        to: 'Flying Blue (AF/KLM)',
        note: 'Redundancy = flexibility',
      });
    if (hasCapOne)
      paths.push({
        source: 'Capital One Miles',
        to: 'Flying Blue (AF/KLM)',
        note: '1:1; watch promos',
      });
    plan.push({
      title: 'SkyTeam Options (when selected)',
      details: ['Hunt Flying Blue Promo Rewards; position if needed.'],
      paths,
    });
  }

  // Marriott
  if (hotelPrefs.includes('marriott') && (hasMR || hasUR)) {
    const paths: Path[] = [];
    if (hasMR)
      paths.push({
        source: 'Membership Rewards',
        to: 'Marriott Bonvoy',
        note: 'Transfer only during 20–30% promos or high-value off-peak + 5th night',
      });
    if (hasUR)
      paths.push({
        source: 'Ultimate Rewards',
        to: 'Marriott Bonvoy',
        note: 'Use only when Hyatt isn’t better',
      });
    plan.push({
      title: 'Priority 2 — Marriott Bonvoy (selective)',
      details: [
        `Target ≥ ${(VAL_AIRLINE_MIN * 100).toFixed(1)}¢/pt or wait for promos.`,
        'Use 5th-night-free; compare cash vs points.',
      ],
      paths,
    });
  }

  // Hilton
  if (hotelPrefs.includes('hilton')) {
    const paths: Path[] = [];
    if (hasAspire)
      paths.push({
        source: 'Hilton Honors',
        to: 'Hilton awards',
        note: 'Earn 14x on stays; deploy on WA/Conrad + 5th-night-free',
      });
    if (hasMR)
      paths.push({
        source: 'Membership Rewards',
        to: 'Hilton (1:2)',
        note: 'Top off only for aspirational + 5th-night-free',
      });
    plan.push({
      title: 'Priority 3 — Hilton Honors (aspirational)',
      details: [
        `Hilton typical ~${Math.round(VAL_HILTON * 100)}¢/pt; aim higher with WA/Conrad + 5th night.`,
        hasAspire
          ? 'Use Aspire for Hilton stays (14x + Diamond + free night).'
          : 'Consider Aspire to supercharge Hilton.',
      ],
      paths,
    });
  }

  // Hyatt
  if (hotelPrefs.includes('hyatt') && hasUR) {
    plan.push({
      title: 'Priority 4 — World of Hyatt via UR',
      details: [
        `Hyatt target ≥ ${(VAL_HYATT * 100).toFixed(1)}¢/pt; Park Hyatt/Andaz/Alila often qualify.`,
        'Feed UR via Ink Preferred 3x travel and Ink Cash 5x office supply (gift cards).',
      ],
      paths: [
        {
          source: 'Ultimate Rewards',
          to: 'World of Hyatt',
          note: 'Transfer 1:1 for 2¢+/pt redemptions',
        },
      ],
    });
  }

  // Card-by-merchant hints
  const hints: string[] = [];
  if (cards.includes('chase-ink-cash'))
    hints.push(
      'Amazon: buy gift cards at Staples/Office Depot with Ink Cash → 5x UR'
    );
  if (cards.includes('amex-platinum'))
    hints.push('Flights: book direct or Amex Travel → 5x MR (feed Avios)');
  if (cards.includes('chase-ink-preferred'))
    hints.push('Business travel/shipping/ads: 3x UR → Avios or Hyatt');
  if (cards.includes('capone-venture'))
    hints.push('Everything else: Venture 2x → Avios Triangle as needed');
  if (hints.length)
    plan.push({ title: 'Card-by-Merchant Optimizations', details: hints });

  return plan;
}

function download(name: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function toCSV(blocks: PlanBlock[]) {
  const rows: string[] = ['Section,Source,To,Via,Note,Detail'];
  blocks.forEach(b => {
    if (b.paths) {
      b.paths.forEach(p =>
        rows.push(
          `${q(b.title)},${q(p.source)},${q(p.to)},${q(p.via || '')},${q(p.note || '')},`
        )
      );
    }
    b.details.forEach(d => rows.push(`${q(b.title)},,,,${q(d)}`));
  });
  return rows.join('\n');
  function q(s: string) {
    return `"${(s || '').replaceAll('"', '""')}"`;
  }
}

export default function PointsStrategyPlanner() {
  const [selectedCards, setSelectedCards] = useLocalState<string[]>(
    'ps.cards',
    ['capone-venture', 'amex-platinum', 'hilton-aspire', 'chase-ink-preferred']
  );
  const [preferredAir, setPreferredAir] = useLocalState<string[]>('ps.air', [
    'oneworld',
    'ba',
    'ib',
    'qr',
  ]);
  const [preferredHotels, setPreferredHotels] = useLocalState<string[]>(
    'ps.hotels',
    ['marriott', 'hilton', 'hyatt']
  );
  const [homeAirports, setHomeAirports] = useLocalState<string[]>(
    'ps.airports',
    ['DFW']
  );

  const planBlocks = useMemo(
    () =>
      buildPlan({
        cards: selectedCards,
        airPrefs: preferredAir,
        hotelPrefs: preferredHotels,
        airports: homeAirports,
      }),
    [selectedCards, preferredAir, preferredHotels, homeAirports]
  );

  const addCard = (cardId: string) => {
    if (!selectedCards.includes(cardId)) {
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  const removeCard = (cardId: string) => {
    setSelectedCards(selectedCards.filter(id => id !== cardId));
  };

  const addAirline = (airlineId: string) => {
    if (!preferredAir.includes(airlineId)) {
      setPreferredAir([...preferredAir, airlineId]);
    }
  };

  const removeAirline = (airlineId: string) => {
    setPreferredAir(preferredAir.filter(id => id !== airlineId));
  };

  const addHotel = (hotelId: string) => {
    if (!preferredHotels.includes(hotelId)) {
      setPreferredHotels([...preferredHotels, hotelId]);
    }
  };

  const removeHotel = (hotelId: string) => {
    setPreferredHotels(preferredHotels.filter(id => id !== hotelId));
  };

  const addHomeAirport = (airportCode: string) => {
    if (!homeAirports.includes(airportCode)) {
      setHomeAirports([...homeAirports, airportCode]);
    }
  };

  const removeHomeAirport = (airportCode: string) => {
    setHomeAirports(homeAirports.filter(code => code !== airportCode));
  };

  return (
    <div className="card">
      <div className="hd">
        <div className="h1">Points Strategy Planner</div>
        <div className="desc">
          Select your cards, airline networks/partners, hotel programs, and home
          airport. The rules engine will generate a prioritized plan.
        </div>
      </div>
      <div className="bd">
        {/* Two Column Layout */}
        <div className="two-column-layout">
          
          {/* Section 1: Credit Cards */}
          <div className="section-pair">
            <div className="section-pair-header">
              <h2>Credit Cards</h2>
            </div>
            <div className="section-pair-content">
              {/* Left Column - Available Cards */}
              <div className="left-column">
                <div className="column-section">
                  <div className="h3">Available Cards</div>
                  <div className="options-container">
                    {ALL_CARDS.map(card => (
                      <div
                        key={card.id}
                        className={`option-item ${selectedCards.includes(card.id) ? 'selected' : ''}`}
                        onClick={() => addCard(card.id)}
                      >
                        <div>
                          <div className="option-name">{card.name}</div>
                          <div className="small">{card.issuer} — {card.currency}</div>
                        </div>
                        {selectedCards.includes(card.id) && (
                          <span className="option-checkmark">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Selected Cards */}
              <div className="right-column">
                <div className="column-section">
                  <div className="h3">Selected Cards ({selectedCards.length})</div>
                  <div className="selected-items-container">
                    {selectedCards.length === 0 ? (
                      <div className="small empty-state">
                        Click on cards in the left column to select them
                      </div>
                    ) : (
                      selectedCards.map(cardId => {
                        const card = ALL_CARDS.find(c => c.id === cardId);
                        return card ? (
                          <div key={card.id} className="selected-item">
                            <div>
                              <div className="option-name">{card.name}</div>
                              <div className="small">{card.issuer} — {card.currency}</div>
                            </div>
                            <button
                              className="btn small remove-button"
                              onClick={() => removeCard(card.id)}
                            >
                              Remove
                            </button>
                          </div>
                        ) : null;
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Airports & Airlines */}
          <div className="section-pair">
            <div className="section-pair-header">
              <h2>Airports & Airlines</h2>
            </div>
            <div className="section-pair-content">
              {/* Left Column - Available Airports & Airlines */}
              <div className="left-column">
                <div className="section-group">
                  <div className="section-header">
                    <div className="h3">Airline Programs & Home Airports</div>
                  </div>
                  
                  {/* Home Airport Selection - At the top */}
                  <div className="home-airport-section">
                    <div className="h4">Home Airports</div>
                    <div className="airport-input-row">
                      <select
                        className="select"
                        aria-label="Select common airport"
                        value=""
                        onChange={e => {
                          if (e.target.value) {
                            addHomeAirport(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">-- Add airport --</option>
                        {AIRPORTS.map(a => (
                          <option key={a.code} value={a.code}>
                            {a.code} — {a.city}, {a.country}
                          </option>
                        ))}
                      </select>
                      <input
                        className="input mono"
                        placeholder="DFW"
                        maxLength={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.currentTarget.value) {
                            const code = e.currentTarget.value.toUpperCase();
                            if (/^[A-Z]{3}$/.test(code)) {
                              addHomeAirport(code);
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                    
                    {/* Selected Home Airports */}
                    <div className="selected-airports">
                      {homeAirports.map(airportCode => (
                        <div key={airportCode} className="airport-tag">
                          <span>{airportCode}</span>
                          <button
                            className="remove-airport-btn"
                            onClick={() => removeHomeAirport(airportCode)}
                            aria-label={`Remove ${airportCode}`}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {homeAirports.length === 0 && (
                        <div className="small empty-state">No home airports selected</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="airline-options">
                    <div className="h4">Airline Programs</div>
                    <div className="options-container">
                      {ALLIANCES.map(airline => (
                        <div
                          key={airline.id}
                          className={`option-item ${preferredAir.includes(airline.id) ? 'selected' : ''}`}
                          onClick={() => addAirline(airline.id)}
                        >
                          <div className="option-content">{airline.label}</div>
                          {preferredAir.includes(airline.id) && (
                            <span className="option-checkmark">✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Selected Airports & Airlines */}
              <div className="right-column">
                <div className="section-group">
                  <div className="section-header">
                    <div className="h3">Selected Airports & Airlines</div>
                  </div>
                  
                  {/* Selected Home Airports */}
                  <div className="selected-airports-section">
                    <div className="h4">Selected Home Airports ({homeAirports.length})</div>
                    <div className="selected-items-container">
                      {homeAirports.length === 0 ? (
                        <div className="small empty-state">No home airports selected</div>
                      ) : (
                        homeAirports.map(airportCode => (
                          <div key={airportCode} className="selected-item">
                            <div className="option-content">{airportCode}</div>
                            <button
                              className="btn small remove-button"
                              onClick={() => removeHomeAirport(airportCode)}
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  {/* Selected Airlines */}
                  <div className="selected-airlines-section">
                    <div className="h4">Selected Airlines ({preferredAir.length})</div>
                    <div className="selected-items-container">
                      {preferredAir.length === 0 ? (
                        <div className="small empty-state">
                          Click on airlines in the left column to select them
                        </div>
                      ) : (
                        preferredAir.map(airlineId => {
                          const airline = ALLIANCES.find(a => a.id === airlineId);
                          return airline ? (
                            <div key={airline.id} className="selected-item">
                              <div className="option-content">{airline.label}</div>
                              <button
                                className="btn small remove-button"
                                onClick={() => removeAirline(airline.id)}
                              >
                                Remove
                              </button>
                            </div>
                          ) : null;
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Hotels */}
          <div className="section-pair">
            <div className="section-pair-header">
              <h2>Hotel Programs</h2>
            </div>
            <div className="section-pair-content">
              {/* Left Column - Available Hotels */}
              <div className="left-column">
                <div className="column-section">
                  <div className="h3">Available Hotel Programs</div>
                  <div className="options-container">
                    {HOTEL_PROGRAMS.map(hotel => (
                      <div
                        key={hotel.id}
                        className={`option-item ${preferredHotels.includes(hotel.id) ? 'selected' : ''}`}
                        onClick={() => addHotel(hotel.id)}
                      >
                        <div className="option-content">{hotel.label}</div>
                        {preferredHotels.includes(hotel.id) && (
                          <span className="option-checkmark">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Selected Hotels */}
              <div className="right-column">
                <div className="column-section">
                  <div className="h3">Selected Hotels ({preferredHotels.length})</div>
                  <div className="selected-items-container">
                    {preferredHotels.length === 0 ? (
                      <div className="small empty-state">
                        Click on hotels in the left column to select them
                      </div>
                    ) : (
                      preferredHotels.map(hotelId => {
                        const hotel = HOTEL_PROGRAMS.find(h => h.id === hotelId);
                        return hotel ? (
                          <div key={hotel.id} className="selected-item">
                            <div className="option-content">{hotel.label}</div>
                            <button
                              className="btn small remove-button"
                              onClick={() => removeHotel(hotel.id)}
                            >
                              Remove
                            </button>
                          </div>
                        ) : null;
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        <div className="hr"></div>

        <div className="badges">
          <button
            className="btn primary"
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth',
              })
            }
          >
            Run Rules Engine
          </button>
          <button
            className="btn"
            onClick={() => {
              const json = JSON.stringify(
                {
                  selectedCards,
                  preferredAir,
                  preferredHotels,
                  homeAirports,
                  plan: planBlocks,
                },
                null,
                2
              );
              download('points_strategy_plan.json', json);
            }}
          >
            Export JSON
          </button>
          <button
            className="btn"
            onClick={() => {
              const csv = toCSV(planBlocks);
              download('points_strategy_plan.csv', csv, 'text/csv');
            }}
          >
            Export CSV
          </button>
          <button
            className="btn"
            onClick={() => {
              setSelectedCards([
                'capone-venture',
                'amex-platinum',
                'hilton-aspire',
                'chase-ink-preferred',
              ]);
              setPreferredAir(['oneworld', 'ba', 'ib', 'qr']);
              setPreferredHotels(['marriott', 'hilton', 'hyatt']);
              setHomeAirports(['DFW']);
            }}
          >
            Reset Defaults
          </button>
        </div>

        {/* Visual separator for Strategy Plan section */}
        <div className="strategy-plan-separator">
          <div className="separator-line"></div>
          <div className="separator-text">Strategy Results</div>
          <div className="separator-line"></div>
        </div>

        <div className="strategy-plan-section">
          <div className="h1">Optimized Strategy Plan</div>
          <div className="small">
            Prioritized by your selections with explicit paths and notes.
          </div>
          {planBlocks.length === 0 && (
            <div className="small strategy-plan-empty">
              Add at least one card, an airline network, and a hotel program.
            </div>
          )}
          <div className="strategy-plan-grid">
            {planBlocks.map((b, i) => (
              <div
                key={i}
                className="card strategy-plan-card"
              >
                <div className="bd">
                  <div className="h1 strategy-plan-title">
                    {b.title}
                  </div>
                  {b.paths && b.paths.length > 0 && (
                    <div className="strategy-plan-section">
                      <div className="small">Transfer Paths:</div>
                      <ul className="list">
                        {b.paths.map((p, idx) => (
                          <li key={idx}>
                            <b>{p.source}</b> → <b>{p.to}</b>
                            {p.via ? ` via ${p.via}` : ''}
                            {p.note ? ` — ${p.note}` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {b.details && b.details.length > 0 && (
                    <div className="strategy-plan-section">
                      <div className="small">Notes:</div>
                      <ul className="list">
                        {b.details.map((d, j) => (
                          <li key={j}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; hint?: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () =>
      options.filter(o =>
        (o.label + ' ' + (o.hint || ''))
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [options, query]
  );
  const toggle = (val: string) => {
    const s = new Set(value);
    s.has(val) ? s.delete(val) : s.add(val);
    onChange(Array.from(s));
  };
  return (
    <div>
      <input
        className="input"
        placeholder="Search…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />
      <div className="multiselect-container">
        {filtered.map(opt => (
          <label
            key={opt.value}
            className="multiselect-option"
          >
            <input
              type="checkbox"
              checked={value.includes(opt.value)}
              onChange={() => toggle(opt.value)}
            />
            <span>{opt.label}</span>
            {opt.hint && (
              <span className="small option-hint">
                {opt.hint}
              </span>
            )}
          </label>
        ))}
        {filtered.length === 0 && <div className="small">No results</div>}
      </div>
    </div>
  );
}
