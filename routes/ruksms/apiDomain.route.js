import { Router } from "express";
import * as apiDoCon from "../../controllers/apiDomain.controller.js";
const apiDomainRoute = Router();
apiDomainRoute.get("/", apiDoCon.allApiDomain);
apiDomainRoute.post("/", apiDoCon.createApiDomain);
apiDomainRoute.put("/:id", apiDoCon.updateApiDomain);
apiDomainRoute.delete("/:id", apiDoCon.deleteApiDomain);
export default apiDomainRoute;
