package grp.gfr.basic.controller;


import grp.gfr.basic.model.CurrentAgencyRelationDTO;
import grp.gfr.basic.service.CurrentAgencyRelationService;
import grp.gfr.handle.GfrExceptionMethod;
import grp.gfr.handle.GfrExceptionTarget;
import grp.gfr.util.Fr2SessionUtil;
import grp.gfr.util.ResultUtil;
import grp.pt.core.Paging;
import grp.pt.core.ReturnData;
import grp.pt.util.Pagination;
import grp.pt.util.model.Session;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@Api(tags = {"要素与报送主体单位对应关系"})
@RestController
@GfrExceptionTarget
@RequestMapping("/CurrentAgencyRelation")
public class CurrentAgencyRelationController {
    private Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private CurrentAgencyRelationService currentAgencyRelationService;

    @Autowired
    private ElementListController elementListController;

    @Autowired
    private GfrPublicController publicController;

    @GetMapping(value = "/getCurrentAgency")
    @ApiOperation(value = "获取账套的往来单位")
    @GfrExceptionMethod(code = "9999", value = "获取账套的往来单位失败")
    public ReturnData getCurrentAgency(@RequestParam(value = "set_id", required = true) String set_id){
        ReturnData returnData = new ReturnData();
        List<Map<String, Object>> List = currentAgencyRelationService.getCurrentAgency(set_id);
        returnData = ResultUtil.returnSuccess(List);
        return returnData;
    }


    @PostMapping("/updateCurrentAgencyRelation")
    @ApiOperation(value = "保存")
    @GfrExceptionMethod(code = "9999", value = "保存失败")
    public ReturnData updateCurrentAgencyRelation(@RequestBody List<CurrentAgencyRelationDTO> list) {
        ReturnData returnData = new ReturnData<>();
        Session se = Fr2SessionUtil.getSession();
        currentAgencyRelationService.updateCurrentAgencyRelation(list, se);
        returnData.setReason("保存成功");
        return returnData;
    }


    /**
     * 分頁查詢
     *
     * @param paging
     * @param set_id
     * @return
     */
    @PostMapping(value = "/queryCurrentAgencyRelationByPage")
    @ApiOperation(value = "分页查询")
    @GfrExceptionMethod(code = "9999", value = "查询要素与报送主体单位对应关系失败")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "nowPage", value = "页码", required = true, dataType = "int", paramType = "query"),
            @ApiImplicitParam(name = "nowPageNo", value = "每页条数", required = true, dataType = "int", paramType = "query"),
            @ApiImplicitParam(name = "set_id", value = "账套ID", required = true, dataType = "String", paramType = "query")
    })
    public ReturnData<Pagination<CurrentAgencyRelationDTO>> queryCurrentAgencyRelationByPage(Paging paging, Long set_id, int bookset_type, Long model_set_id, String ele_code, String types,String filter) throws Exception{
        ReturnData returnData = new ReturnData();
        Session se = Fr2SessionUtil.getSession();
        ReturnData<List<Map<String, Object>>> baseInfoListForCompare = elementListController.getBaseInfoListForCompare(ele_code, set_id, bookset_type, model_set_id);
        returnData = currentAgencyRelationService.queryCurrentAgencyRelationByPage(paging, set_id, ele_code, types, baseInfoListForCompare.getData(), se,filter);
        returnData.setReason("查询要素与报送主体对应关系成功！");
        return returnData;
    }

    @GetMapping("/deleteCurrentAgencyRelation")
    @ApiOperation(value = "删除要素与报送主体单位对应关系")
    @GfrExceptionMethod(code = "9999", value = "删除要素与报送主体单位对应关系失败")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "set_id", value = "账套ID", required = true, dataType = "String", paramType = "query"),
            @ApiImplicitParam(name = "fund_tra_obj_code ", value = "往来编码", required = true, dataType = "String", paramType = "query")
    })
    public ReturnData deleteCurrentAgencyRelation(@RequestParam(value = "current_agency_relation_id", required = true) String id) {
        ReturnData returnData = new ReturnData();
        Session se = Fr2SessionUtil.getSession();
        currentAgencyRelationService.deleteCurrentAgencyRelation(id, se);
        returnData.setReason("删除成功~");
        return returnData;
    }

    @GetMapping("/getEleCode")
    @ApiOperation(value = "查询已有的要素")
    @GfrExceptionMethod(code = "9999", value = "查询要素失败")
    public ReturnData getEleCode(String set_id) {
        ReturnData returnData = new ReturnData();
        Session se = Fr2SessionUtil.getSession();
        returnData.setData(currentAgencyRelationService.getEleCode(set_id, se));
        returnData.setReason("查询成功~");
        return returnData;
    }

    /**
     * 批量设置预算单位
     * @param set_id
     * @param bookset_type
     * @param model_set_id
     * @param ele_code
     * @param ele_name
     * @param mof_div_code
     * @return
     */
    @PostMapping("/bacthAddAgency")
    @ApiOperation(value = "批量设置预算单位")
    @GfrExceptionMethod(code = "9999", value = "设置失败")
    public ReturnData bacthAddAgency( Long set_id, int bookset_type, Long model_set_id, String ele_code,String ele_name,String mof_div_code) throws Exception{
        ReturnData returnData = new ReturnData();
        Session se = Fr2SessionUtil.getSession();
        ReturnData<List<Map<String, Object>>> baseInfoListForCompare = elementListController.getBaseInfoListForCompare(ele_code, set_id, bookset_type, model_set_id);
        currentAgencyRelationService.bacthAddAgency(baseInfoListForCompare.getData(),set_id, ele_code, ele_name, mof_div_code, se);
        returnData.setStatus_code("0000");
        returnData.setReason("设置成功");
        return returnData;
    }

    @PostMapping("/aiFundTraobjType")
    @ApiOperation(value = "自动识别")
    @GfrExceptionMethod(code = "9999", value = "自动识别失败")
    public ReturnData aiFundTraobjType( Long set_id, int bookset_type, Long model_set_id, String ele_code,String ele_name,String mof_div_code,String agency_code) throws Exception{
        ReturnData returnData = new ReturnData();
        Session se = Fr2SessionUtil.getSession();
        //要素list
        List<Map<String, Object>> baseInfoListForCompare = elementListController.getBaseInfoListForCompare(ele_code, set_id, bookset_type, model_set_id).getData();
        List<Map<String,Object>> fundTraobjTypeList = (List<Map<String,Object>>) publicController.getBaseInfoEnabledTree("FundTraobjType", 0, 0, false, true, null, null, se.getBusiYear()).getData();
        currentAgencyRelationService.aiFundTraobjType(baseInfoListForCompare,set_id,ele_code,ele_name,mof_div_code,fundTraobjTypeList, se,agency_code);
        returnData.setStatus_code("0000");
        returnData.setReason("自动识别成功");
        return returnData;
    }

    @ApiOperation(value = "批量自动识别")
    @GfrExceptionMethod(code = "9999", value = "批量自动识别失败")
    @PostMapping(value = "/batchAutoRecognize")
    public ReturnData batchAutoRecognize(@RequestBody List<Map<String, Object>> setList, int flag) throws Exception {
        ReturnData returnData = new ReturnData();
        Session se = Fr2SessionUtil.getSession();
        currentAgencyRelationService.batchAutoRecognize(setList, flag, se);
        returnData.setStatus_code("0000");
        returnData.setReason("批量自动识别成功");
        return returnData;
    }
}
