import { citiesByMarket, loadDeals } from "@/lib/deals";
import SearchApp from "@/components/SearchApp";

export default function Home() {
  const deals = loadDeals();
  const cities = citiesByMarket(deals);

  return <SearchApp allDeals={deals} citiesByMarket={cities} />;
}
