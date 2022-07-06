/**
 * @NApiVersion 2.x
 * @NScriptType workflowactionscript
 */
 define(['N/record','N/search'],

 /**
  * @param {record} record
  * @param {search} search
  * @returns 
  */
    function(record,search) {
       
        // Function to check the additional approver for Vendor Bill in Vendor Bill Workflow
        function chkAdditnapprover(scriptContext) {
            var vendorBillRecord = scriptContext.newRecord;
            log.debug({
                title : 'record id',
                details : vendorBillRecord
            });
            //Read the department from Vendor Bill
            var vendorBillDept = vendorBillRecord.getValue({
                fieldId : 'department'
            });
            log.debug({
                title : 'recDept',
                details : vendorBillDept
            });
            //Read the subsidary from Vendor Bill
            var vendorBillSubsidary = vendorBillRecord.getValue({
                fieldId : 'subsidiary'
            });
            log.debug({
                title : 'recSubsidary',
                details : vendorBillSubsidary
            });
            //Read the total Bill Amount from Vendor Bill
            var vendorBillAmount = vendorBillRecord.getValue({
                fieldId : 'usertotal'
            });            
            log.debug({
                title : 'recAmount',
                details : vendorBillAmount
            });
            // Read Approver Level from Vendor Bill
            var vendorBillApproverLvl = vendorBillRecord.getValue({
                fieldId : 'custbody_approval_level'
            });       
            //vendorBillApproverLvl=vendorBillApproverLvl+1;
            log.debug({
                title : 'Approver Level',
                details : vendorBillApproverLvl
            });            
            //Search on the custom record - CS Dept for additional approvers
            var approverSearch = search.create({
                type : 'customrecord_cs_dept',
                filters : [
                    ['custrecord_cs_dept_appr1',search.Operator.ANYOF,vendorBillDept],'and',
                    ['custrecord_cs_dept_sub_appr1',search.Operator.ANYOF,vendorBillSubsidary],'and',                    
                    ['custrecord_cs_dept_min_amt_appr1',search.Operator.LESSTHANOREQUALTO,vendorBillAmount],'and',
                    ['custrecord_cs_dept_max_amt_appr1',search.Operator.GREATERTHANOREQUALTO,vendorBillAmount],'and',
                    ['isinactive',search.Operator.IS,'F']
                ],
                columns : [
                    search.createColumn({name: 'custrecord_cs_dept_appr_lev_appr1', sort: search.Sort.ASC})                   
                ]
            }); 
            //Get the record count from the search - recordsearchObj
            var finalApprover;
            if(approverSearch){
                var searchResult = approverSearch.run().getRange(0,50);
                finalApprover = searchResult[0].getValue({
                    name : 'custrecord_cs_dept_appr_lev_appr1'
                });
                log.debug({
                    title : 'finalApprover',
                    details : finalApprover
                });
            }
            return finalApprover;
        }    
        return {
            onAction : chkAdditnapprover
        };        
    });    