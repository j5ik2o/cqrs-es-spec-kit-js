#!/bin/sh

# shellcheck disable=SC2046
cd $(dirname "$0") && pwd

# shellcheck disable=SC2039
if [ $# == 0 ]; then
  echo "Parameters are empty."
  exit 1
fi

while getopts e: OPT; do
  # shellcheck disable=SC2220
  case ${OPT} in
  "e") ENV_NAME="$OPTARG" ;;
  esac
done

export AWS_DEFAULT_REGION=$AWS_REGION
export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-x}
export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-x}
export AWS_PAGER=""

ENDPOINT_URL_OPTION=""
DYNAMODB_ENDPOINT=${DYNAMODB_ENDPOINT:-localhost:31566}

JOURNAL_TABLE_NAME=${JOURNAL_TABLE_NAME:-"${PREFIX}-journal"}
JOURNAL_GSI_NAME=${JOURNAL_GSI_NAME:-"${PREFIX}-aid-index"}
SNAPSHOT_TABLE_NAME=${SNAPSHOT_TABLE_NAME:-"${PREFIX}-snapshot"}
SNAPSHOT_GSI_NAME=${SNAPSHOT_GSI_NAME:-"${PREFIX}-aid-index"}

echo "DYNAMODB_ENDPOINT = ${DYNAMODB_ENDPOINT}"
echo "JOURNAL_TABLE_NAME = ${JOURNAL_TABLE_NAME}"
echo "JOURNAL_GSI_NAME = ${JOURNAL_GSI_NAME}"
echo "SNAPSHOT_TABLE_NAME = ${SNAPSHOT_TABLE_NAME}"
echo "SNAPSHOT_GSI_NAME = ${SNAPSHOT_GSI_NAME}"

if [ "${ENV_NAME}" = "dev" ]; then
  # shellcheck disable=SC2034
  ENDPOINT_URL_OPTION=" --endpoint-url http://${DYNAMODB_ENDPOINT} "
fi

table_exists() {
  TABLE_NAME=$1
  # shellcheck disable=SC2086
  DESCRIBE_OUTPUT=$(aws dynamodb describe-table ${ENDPOINT_URL_OPTION} --table-name "${TABLE_NAME}" 2>&1)
  STATUS=$?
  if [ ${STATUS} -eq 0 ]; then
    return 0
  fi

  echo "${DESCRIBE_OUTPUT}" | grep -q "ResourceNotFoundException"
  if [ $? -eq 0 ]; then
    return 1
  fi

  echo "Failed to describe table ${TABLE_NAME}: ${DESCRIBE_OUTPUT}" >&2
  exit 1
}

if table_exists "${JOURNAL_TABLE_NAME}"; then
  echo "Table ${JOURNAL_TABLE_NAME} already exists. Skipping creation."
else
  echo "Creating table ${JOURNAL_TABLE_NAME}..."
  aws dynamodb create-table \
    ${ENDPOINT_URL_OPTION} \
    --table-name "${JOURNAL_TABLE_NAME}" \
    --attribute-definitions \
      AttributeName=pkey,AttributeType=S \
      AttributeName=skey,AttributeType=S \
      AttributeName=aid,AttributeType=S \
      AttributeName=seq_nr,AttributeType=N \
    --key-schema \
      AttributeName=pkey,KeyType=HASH \
      AttributeName=skey,KeyType=RANGE \
    --provisioned-throughput \
      ReadCapacityUnits=10,WriteCapacityUnits=10 \
    --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"${JOURNAL_GSI_NAME}\",
        \"KeySchema\": [{\"AttributeName\":\"aid\",\"KeyType\":\"HASH\"},
                        {\"AttributeName\":\"seq_nr\",\"KeyType\":\"RANGE\"}],
        \"Projection\":{
          \"ProjectionType\":\"ALL\"
        },
        \"ProvisionedThroughput\": {
          \"ReadCapacityUnits\": 10,
          \"WriteCapacityUnits\": 10
        }
      }
    ]" \
    --stream-specification StreamEnabled=true,StreamViewType=NEW_IMAGE || {
      echo "Failed to create table ${JOURNAL_TABLE_NAME}" >&2
      exit 1
    }
fi

if table_exists "${SNAPSHOT_TABLE_NAME}"; then
  echo "Table ${SNAPSHOT_TABLE_NAME} already exists. Skipping creation."
else
  echo "Creating table ${SNAPSHOT_TABLE_NAME}..."
  # shellcheck disable=SC2086
  aws dynamodb create-table \
    ${ENDPOINT_URL_OPTION} \
    --table-name "${SNAPSHOT_TABLE_NAME}" \
    --attribute-definitions \
      AttributeName=pkey,AttributeType=S \
      AttributeName=skey,AttributeType=S \
      AttributeName=aid,AttributeType=S \
      AttributeName=seq_nr,AttributeType=N \
    --key-schema \
      AttributeName=pkey,KeyType=HASH \
      AttributeName=skey,KeyType=RANGE \
    --provisioned-throughput \
      ReadCapacityUnits=10,WriteCapacityUnits=10 \
    --global-secondary-indexes \
    "[
      {
        \"IndexName\": \"${SNAPSHOT_GSI_NAME}\",
        \"KeySchema\": [{\"AttributeName\":\"aid\",\"KeyType\":\"HASH\"},
                        {\"AttributeName\":\"seq_nr\",\"KeyType\":\"RANGE\"}],
        \"Projection\":{
          \"ProjectionType\":\"ALL\"
        },
        \"ProvisionedThroughput\": {
          \"ReadCapacityUnits\": 10,
          \"WriteCapacityUnits\": 10
        }
      }
    ]" || {
      echo "Failed to create table ${SNAPSHOT_TABLE_NAME}" >&2
      exit 1
    }
fi
