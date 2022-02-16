module.exports = `
#set($inputRoot = $input.path('$.Items'))
[
#foreach($car in $inputRoot)
{
  "status": "$car.status.S.split('#')[0]",
  "client": {
    "name": "$car.clientName.S",
    "id": "$car.clientId.S"
  },
  "rentalPeriod": {
    "id": "$car.sk.S.split('#')[2]"
  },
  "contract": {
    "id": "$car.sk.S.split('#')[1]",
    "amendments": [
      #foreach($amendment in $car.amendments.L) {
        "id": "$amendment.M.id.S",
        "options": [
          #foreach($option in $amendment.M.options.L) {
            "name": "$option.M.name.S"
            }#if($foreach.hasNext),#end
          #end
        ]
      }#if($foreach.hasNext),#end
    #end
    ],
    "order": {
      "id": "$car.order.M.id.S",
      "options": [
        #foreach($option in $car.order.M.options.L) {
          "name": "$option.M.name.S"
          }#if($foreach.hasNext),#end
        #end
      ]
    }
  },
  "model": {
    "id": "$car.carModel.M.id.S"
  }
}#if($foreach.hasNext),#end
#end
]`