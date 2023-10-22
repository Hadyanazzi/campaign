import { Observable, map } from "rxjs";
import { GetTemplateReq } from "@/entity/message/GetTemplateReq";
import { GetTemplateResp } from "@/entity/message/GetTemplateResp";
import { BaseService } from "./BaseService";
import { AxiosInstance } from "axios";
import { GetDetailTemplateReq } from "@/entity/message/GetDetailTemplateReq";
import { GetDetailTemplateResp } from "@/entity/message/GetDetailTemplateResp";
import { CreateTemplateReq } from "@/entity/message/CreateTemplateReq";
import { BaseResp } from "@/entity/BaseResp";

export interface TemplateService {
    getTemplate(template: GetTemplateReq): Observable<GetTemplateResp>;
    getDetailTemplate(template: GetDetailTemplateReq): Observable<GetDetailTemplateResp>;
    createTemplate(template: CreateTemplateReq): Observable<BaseResp>;
}

export class TemplateServiceImpl extends BaseService implements TemplateService {
    readonly API_ENDPOINT = "/template";

    constructor(
        protected axiosClient: AxiosInstance,
    ) {
        super(axiosClient);
    }

    getTemplate(template: GetTemplateReq): Observable<GetTemplateResp> {
        const params: any = {
            page: template.page,
            limit: template.limit,
        }

        if (template.sort_by?.trim().length > 0) {
            params["sort-by"] = template.sort_by;
        }

        if (template.template_name?.trim().length > 0) {
            params["template-name"] = template.template_name;
        }

        return this.httpGet(this.API_ENDPOINT, { params })
            .pipe(
                map((response) => {
                    return JSON.parse(JSON.stringify(response.data as string))
                })
            )

    }

    getDetailTemplate(template: GetDetailTemplateReq): Observable<GetDetailTemplateResp> {
        const params = {
            "template-id": template.template_id
        };

        return this.httpGet(`${this.API_ENDPOINT}/detail`, { params })
            .pipe(
                map((response) => JSON.parse(JSON.stringify(response.data as string)))
            )
    }
    
    createTemplate(template: CreateTemplateReq): Observable<BaseResp> {
        return this.httpPost(this.API_ENDPOINT, template)
            .pipe(
                map((response) => JSON.parse(JSON.stringify(response.data as string)))
            )
    }

}