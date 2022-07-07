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
       
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @Since 2016.1
         */

        //Send Bill for Approval to Approver Level 1
        function vendorBillApproval(scriptContext) {
            var vendorBillRecord = scriptContext.newRecord;
            /*log.debug({
                title : 'record id',
                details : recId
            });*/
            // Read the department from Vendor BIll
            var vendorBillDept = vendorBillRecord.getValue({
                fieldId : 'department'
            });
            log.debug({
                title : 'recDept',
                details : vendorBillDept
            });
            // Read subsidary from Vendor Bill
            var vendorBillSubsidary = vendorBillRecord.getValue({
                fieldId : 'subsidiary'
            });
            log.debug({
                title : 'recSubsidary',
                details : vendorBillSubsidary
            });
            // Read total Bill Amount from Vendor Bill
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
            log.debug({
                title : 'Approver Level',
                details : vendorBillApproverLvl
            });                        
            // Search on the custom record - CS Dept for additional approvers
            var approverSearch = search.create({
                type : 'customrecord_cs_dept',
                filters : [
                    ['custrecord_cs_dept_appr1',search.Operator.ANYOF,vendorBillDept],'and',
                    ['custrecord_cs_dept_sub_appr1',search.Operator.ANYOF,vendorBillSubsidary],'and',
                    ['custrecord_cs_dept_appr_lev_appr1',search.Operator.EQUALTO,vendorBillApproverLvl],'and',
                    ['isinactive',search.Operator.IS,'F']
                ],
                columns : [
                    search.createColumn({name: 'custrecord_cs_dept_appr_lev_appr1', sort: search.Sort.ASC}),
                    search.createColumn({name: 'custrecord_cs_dept_appr_appr1'}),
                    search.createColumn({name: 'isinactive'})
                ]
            }); 
            var approver;   
            if(approverSearch){
                var searchResult = approverSearch.run().getRange(0,10);
                log.debug({
                    title : 'searchResult',
                    details : searchResult
                })
                log.debug({
                    title : 'searchResult-count',
                    details : searchResult.length
                });
            } 
            approver = searchResult[0].getValue({
                name : 'custrecord_cs_dept_appr_appr1'
            });
            log.debug({
                title : 'approver',
                details : approver
            })            ;                     
            return approver;
        }
        return {
            onAction : vendorBillApproval
        };
    });