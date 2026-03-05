export const CATEGORY_FILTERS = {
  216: {
    filters: [
      { key: 'autos.fuel_s', label: 'Kraftstoff', options: [
        { value: 'benzin', label: 'Benzin' },
        { value: 'diesel', label: 'Diesel' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'elektro', label: 'Elektro' },
        { value: 'erdgas_cng', label: 'Erdgas (CNG)' },
        { value: 'autogas_lpg', label: 'Autogas (LPG)' },
      ]},
      { key: 'autos.shift_s', label: 'Getriebe', options: [
        { value: 'automatik', label: 'Automatik' },
        { value: 'manuell', label: 'Manuell' },
      ]},
      { key: 'autos.typ_s', label: 'Fahrzeugtyp', options: [
        { value: 'kleinwagen', label: 'Kleinwagen' },
        { value: 'limousine', label: 'Limousine' },
        { value: 'kombi', label: 'Kombi' },
        { value: 'suv', label: 'SUV' },
        { value: 'cabrio', label: 'Cabrio' },
        { value: 'bus', label: 'Bus' },
        { value: 'coupe', label: 'Coupé' },
      ]},
      { key: 'autos.anzahl_tueren_s', label: 'Türen', options: [
        { value: '2_3', label: '2-3' },
        { value: '4_5', label: '4-5' },
        { value: '6_7', label: '6-7' },
      ]},
      { key: 'autos.schaden_s', label: 'Unfallfrei', options: [
        { value: 'nein', label: 'Ja (unfallfrei)' },
        { value: 'ja', label: 'Nein' },
      ]},
      { key: 'autos.marke_s', label: 'Marke', type: 'brand_grid', options: [
        { value: 'vw', label: 'VW', logo: 'https://cdn.simpleicons.org/volkswagen/white' },
        { value: 'bmw', label: 'BMW', logo: 'https://cdn.simpleicons.org/bmw/white' },
        { value: 'mercedes_benz', label: 'Mercedes', logo: 'https://cdn.simpleicons.org/mercedes/white' },
        { value: 'audi', label: 'Audi', logo: 'https://cdn.simpleicons.org/audi/white' },
        { value: 'ford', label: 'Ford', logo: 'https://cdn.simpleicons.org/ford/white' },
        { value: 'opel', label: 'Opel', logo: 'https://cdn.simpleicons.org/opel/white' },
        { value: 'toyota', label: 'Toyota', logo: 'https://cdn.simpleicons.org/toyota/white' },
        { value: 'renault', label: 'Renault', logo: 'https://cdn.simpleicons.org/renault/white' },
        { value: 'skoda', label: 'Škoda', logo: 'https://cdn.simpleicons.org/skoda/white' },
        { value: 'hyundai', label: 'Hyundai', logo: 'https://cdn.simpleicons.org/hyundai/white' },
        { value: 'kia', label: 'Kia', logo: 'https://cdn.simpleicons.org/kia/white' },
        { value: 'fiat', label: 'Fiat', logo: 'https://cdn.simpleicons.org/fiat/white' },
        { value: 'peugeot', label: 'Peugeot', logo: 'https://cdn.simpleicons.org/peugeot/white' },
        { value: 'seat', label: 'SEAT', logo: 'https://cdn.simpleicons.org/seat/white' },
        { value: 'honda', label: 'Honda', logo: 'https://cdn.simpleicons.org/honda/white' },
        { value: 'porsche', label: 'Porsche', logo: 'https://cdn.simpleicons.org/porsche/white' },
        { value: 'tesla', label: 'Tesla', logo: 'https://cdn.simpleicons.org/tesla/white' },
        { value: 'volvo', label: 'Volvo', logo: 'https://cdn.simpleicons.org/volvo/white' },
      ]},
      { key: 'autos.baujahr_i', label: 'Baujahr ab', type: 'range_from', options: [
        { value: '2022:', label: 'Ab 2022' },
        { value: '2020:', label: 'Ab 2020' },
        { value: '2018:', label: 'Ab 2018' },
        { value: '2015:', label: 'Ab 2015' },
        { value: '2010:', label: 'Ab 2010' },
        { value: '2005:', label: 'Ab 2005' },
        { value: '2000:', label: 'Ab 2000' },
      ]},
      { key: 'autos.kilometer_i', label: 'KM-Stand bis', type: 'range_to', options: [
        { value: ':10000', label: 'Bis 10.000 km' },
        { value: ':30000', label: 'Bis 30.000 km' },
        { value: ':50000', label: 'Bis 50.000 km' },
        { value: ':100000', label: 'Bis 100.000 km' },
        { value: ':150000', label: 'Bis 150.000 km' },
        { value: ':200000', label: 'Bis 200.000 km' },
      ]},
    ]
  }
}
