const router = require('express').Router();
const { logger } = require('../../lib/logger');

var const_data = require('../../lib/config');

router.post('/allClusterWise', async (req, res) => {
    try {
        logger.info('--- crc all cluster wise api ---');

        // to store the s3 file data to variables
        const_data['getParams']['Key'] = `test/crc_cluster_test.json`;
        const_data['s3'].getObject(const_data['getParams'], function (err, data) {
            if (err) {
                logger.error(err);
                res.status(500).json({ errMsg: "Something went wrong" });
            } else if (!data) {
                logger.error("No data found in s3 file");
                res.status(403).json({ errMsg: "No such data found" });
            } else {
                var myData = JSON.parse(data.Body.toString());
                logger.info('--- crc all cluster wise api response sent ---');
                res.send(myData);
            }
        });
    } catch (e) {
        logger.error(`Error :: ${e}`)
        res.status(500).json({ errMessage: "Internal error. Please try again!!" });
    }
})

router.post('/clusterWise/:distId/:blockId', async (req, res) => {
    try {
        logger.info('--- crc cluster per block and per district api ---');

        const_data['getParams']['Key'] = `test/crc_cluster_test.json`;
        const_data['s3'].getObject(const_data['getParams'], function (err, data) {
            if (err) {
                logger.error(err);
                res.status(500).json({ errMsg: "Something went wrong" });
            } else if (!data) {
                logger.error("No data found in s3 file");
                res.status(403).json({ errMsg: "No such data found" });
            } else {
                let clusterData = data.Body.toString();
                clusterData = JSON.parse(clusterData);
                let distId = req.params.distId;
                let blockId = req.params.blockId;

                let filterData = clusterData['visits'].filter(obj => {
                    return (obj.districtId == distId && obj.blockId == blockId);
                });
                var totalSchoolsVisited = 0;
                var totalSchoolsNotVisited = 0;
                for (let i = 0; i < filterData.length; i++) {
                    totalSchoolsVisited = totalSchoolsVisited + Number(filterData[i].visitedSchoolCount);
                    totalSchoolsNotVisited = totalSchoolsNotVisited + (filterData[i].totalSchools - Number(filterData[i].visitedSchoolCount));
                }
                var schoolsVisitedCount = {
                    "totalSchoolsVisited": totalSchoolsVisited,
                    "totalSchoolsNotVisited": totalSchoolsNotVisited
                }
                logger.info('--- crc cluster per block and per district api response sent ---');
                res.status(200).send({ visits: filterData, schoolsVisitedCount: schoolsVisitedCount });
            }
        });
    } catch (e) {
        logger.error(`Error :: ${e}`)
        res.status(500).json({ errMessage: "Internal error. Please try again!!" });
    }
})

module.exports = router;