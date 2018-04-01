PORT_NUMBER=9000
LOG_FILE="./.e2e.ignore.log"

rm $LOG_FILE

yarn dev | tee $LOG_FILE &

until grep -R "Built at:" $LOG_FILE; do
 sleep 1
done

pkill -f "(chrome)*?(--headless)"

yarn test unit --coverage
yarn test e2e

echo "E2E test finished"

# close server
lsof -i tcp:${PORT_NUMBER} | awk 'NR!=1 {print $2}' | xargs kill;

rm $LOG_FILE

exit 0