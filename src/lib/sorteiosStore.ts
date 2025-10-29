import path from "path";
import { promises as fs } from "fs";

export type SorteioStatus = "ongoing" | "scheduled" | "completed" | "cancelled";

export type Sorteio = {
  id: number;
  name: string;
  description: string;
  creator: string;
  start_date: string;
  end_date: string | null;
  total_number_tickets: number;
  total_tickets_sold: number;
  tickets_price: number;
  tickets_sold: number[];
  platform_fee: number;
  creator_fee: number;
  coin: "ETH" | "USDT" | "WBTC";
  network: "Ethereum" | "Polygon" | "Base";
  status: SorteioStatus;
};

const sorteiosFilePath = path.join(process.cwd(), "src", "lib", "sorteios.json");

export async function readSorteios(): Promise<Sorteio[]> {
  const fileContent = await fs.readFile(sorteiosFilePath, "utf-8");
  return JSON.parse(fileContent) as Sorteio[];
}

export async function writeSorteios(draws: Sorteio[]): Promise<void> {
  const serialized = JSON.stringify(draws, null, 2);
  await fs.writeFile(sorteiosFilePath, serialized, "utf-8");
}
