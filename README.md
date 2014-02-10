[![Build Status](https://travis-ci.org/ICANS/trending-food.png?branch=master)](https://travis-ci.org/ICANS/trending-food)

Trending Food is a simple tool to manage the ordering of meals for lunch in your company or so.
It consist of a REST backend and a frontend component.

### Installation
______________

#### Ubuntu
- sudo apt-get install libicu-dev
- npm install
- cd app/web
- npm install

### Supported Methods
______________

#### Order
<table>

	<tr>
		<td>add</td>
		<td>list</td>
		<td>list by user</td>
		<td>count</td>
		<td>delete</td>
	</tr>

</table>

#### Meal

<table>

	<tr>
		<td>add</td>
		<td>list</td>
		<td>image</td>
		<td>count</td>
		<td>get</td>
		<td>delete</td>
		<td>vote up/down</td>
        <td>amount up/down</td>
        <td>set vegetarian true/false</td>
	</tr>

</table>

#### Mealtimes

<table>

	<tr>
		<td>add</td>
		<td>list</td>
		<td>count</td>
		<td>delete</td>
	</tr>

</table>

#### User

<table>

    <tr>
        <td>add</td>
        <td>get by username</td>
        <td>delete</td>
    </tr>

</table>

#### Favorites

<table>

    <tr>
        <th>Get all favorites</th>
        <td><code>GET /favorites</code></td>
    </tr>
    <tr>
        <th>Get all favorites and mark all favorites by a certain user</th>
        <td><code>GET /favorites "userId=USER_ID"</code></td>
    </tr>
        <th>Get all favorites of a user</th>
        <td><code>GET /user/USER_ID/favorites</code></td>
    </tr>
    <tr>
        <th>Add meal to favorites</th>
        <td><code>POST /favorites "userId=USER_ID&mealId=MEAL_ID"</code></td>
    </tr>
    <tr>
        <th>Delete favorite</th>
        <td><code>DELETE /favorites "userId=USER_ID&mealId=MEAL_ID"</code></td>
    </tr>
</table>
