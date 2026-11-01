import coordinatesCsv from "./demo/coordinates.csv?raw";
import innovationsCsv from "./demo/innovations.csv?raw";
import { parseCoordinatesCsv } from "./parseCoordinatesCsv";
import { parseInnovationsCsv } from "./parseInnovationsCsv";

/**
 * The fictitious 18-language "Demo" family distributed as sample data with the Historical Glottometry engine
 * by Alexandre François and Siva Kalyan (https://marama.huma-num.fr/AF_Glottometry.htm).
 */
export const demoFamily = {
  ...parseInnovationsCsv(innovationsCsv),
  coordinates: parseCoordinatesCsv(coordinatesCsv),
};
